import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Wallet.css";
import { FaWallet } from "react-icons/fa";
import { SiPhonepe } from "react-icons/si";
import { useAuth } from "../../AuthContext/ContextApi";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.") ||
  window.location.hostname.startsWith("172.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:8000`
  : "https://admin-aged-field-2794.fly.dev";

export default function PaymentMethodPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [selectedMethod, setSelectedMethod] = useState("Wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [qrValue, setQrValue] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [cfOrderId, setCfOrderId] = useState("");

  const getAppUpiLink = (app) => {
    if (!qrValue) return qrValue;
    if (app === "generic") return qrValue;
    const upiParams = qrValue.replace(/^upi:\/\/pay\?/, "");
    switch (app) {
      case "phonepe": return `phonepe://pay?${upiParams}`;
      case "gpay":    return `tez://upi/pay?${upiParams}`;
      case "paytm":   return `paytmmp://pay?${upiParams}`;
      default:        return qrValue;
    }
  };

  const [modalError, setModalError] = useState("");

  const handleUpiAppClick = (e, app) => {
    e.preventDefault();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = getAppUpiLink(app);
    } else {
      let appName = "UPI";
      if (app === "gpay") appName = "Google Pay";
      if (app === "phonepe") appName = "PhonePe";
      if (app === "paytm") appName = "Paytm";
      setModalError(`To pay via ${appName} on a laptop, please scan the QR code above using your phone's ${appName} app!`);
    }
  };

  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (!showQrModal) return;

    if (timeLeft <= 0) {
      alert("Payment session expired. Please try again.");
      setShowQrModal(false);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [showQrModal, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPayeeName = () => {
    if (!qrValue) return "Neos Group";
    try {
      const urlParams = new URLSearchParams(qrValue.replace(/^upi:\/\/pay\?/, ""));
      const pn = urlParams.get("pn");
      return pn ? decodeURIComponent(pn) : "Neos Group";
    } catch (e) {
      return "Neos Group";
    }
  };

  const paymentMethods = [
    { label: "Wallet", icon: <FaWallet /> },
    { label: "Payment Gateway", icon: <SiPhonepe /> },
  ];

  /* ---------------- CART ---------------- */
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCart);
  }, []);

  useEffect(() => {
    if (!showQrModal || !qrValue || !cfOrderId) return;

    console.log("=== STARTING QR STATUS POLLING (WALLET) ===");
    const intervalId = setInterval(async () => {
      try {
        // Use PhonePe verify endpoint (cfOrderId is the PhonePe merchant txn id)
        const url = `${API_BASE}/orders/verify-payment/phonepe/${cfOrderId}`;
        const res = await axios.get(url);
        if (res.data && res.data.payment_status === "SUCCESS") {
          console.log("=== PAYMENT DETECTED SUCCESS ===");
          clearInterval(intervalId);
          setShowQrModal(false);

          // Fetch full order details
          const orderRes = await axios.get(`${API_BASE}/orders/by-cashfree/${cfOrderId}`);
          localStorage.removeItem("cartItems");
          navigate("/success", { state: { order: orderRes.data } });
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    }, 2500);

    return () => {
      console.log("=== CLEANING UP POLLING ===");
      clearInterval(intervalId);
    };
  }, [showQrModal, qrValue, cfOrderId, navigate]);

  /* ---------------- WALLET ---------------- */
  useEffect(() => {
    if (!userId || !token) return;

    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API_BASE}/wallets/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWalletBalance(res.data?.balance_amount || 0);
      } catch (err) {
        console.error("Wallet fetch error:", err);
      }
    };

    fetchWallet();
  }, [userId, token]);

  /* ---------------- HELPERS ---------------- */
  const calculateTotalAmount = () =>
    cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

  const createInternalOrder = async (payload) => {
    const res = await axios.post(`${API_BASE}/orders/place`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  /* ---------------- CASHFREE (commented out) ---------------- */
  // eslint-disable-next-line no-unused-vars
  /* const openCashfreeCheckout = (paymentSessionId) => {
    if (!window.Cashfree) {
      setErrorMsg("Cashfree SDK not loaded. Please refresh the page.");
      return;
    }

    // Cashfree SDK v3: use as factory function (NO 'new' keyword)
    const cashfree = window.Cashfree({
      mode: "production",
    });

    cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });
  }; */

  /* ---------------- CONFIRM PAYMENT ---------------- */
  const handleConfirmPayment = async () => {
    setErrorMsg("");

    if (!cartItems.length) {
      setErrorMsg("Cart is empty");
      return;
    }


    if (!userId || !user?.phone_number || !user?.email) {
      setErrorMsg("User phone or email missing");
      return;
    }

    const totalAmount = calculateTotalAmount();

    const itemsPayload = cartItems.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
    }));

    const orderPayload = {
      user_id: userId,
      user_phone: user.phone_number,
      user_email: user.email,
      items: itemsPayload,
      pay_with_wallet: selectedMethod === "Wallet",
      payment_gateway: selectedMethod === "Payment Gateway" ? "phonepe" : "cashfree",
      cashfree_return_url: `${window.location.origin}/success`,
    };

    /* ---------- WALLET FLOW ---------- */
    if (selectedMethod === "Wallet") {
      if (totalAmount > walletBalance) {
        setErrorMsg("Insufficient Wallet Balance");
        return;
      }

      try {
        setIsLoading(true);
        const order = await createInternalOrder(orderPayload);
        localStorage.removeItem("cartItems");
        navigate("/success", { state: { order } });
      } catch (err) {
        setErrorMsg(err?.response?.data?.detail || "Order failed");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    /* ---------- PHONEPE GATEWAY FLOW ---------- */
    if (selectedMethod === "Payment Gateway") {
      try {
        setIsLoading(true);

        const backendOrder = await createInternalOrder(orderPayload);

        // PhonePe flow: Show the QR modal on screen and allow the user to scan & pay!
        if (!backendOrder.payment_session_id) {
          setErrorMsg("Failed to generate payment QR");
          return;
        }
        console.log("PhonePe Dynamic QR String generated:", backendOrder.payment_session_id);
        console.log("PhonePe order_id:", backendOrder.cashfree_order_id);

        // Store order id so polling can verify after scan
        setCfOrderId(backendOrder.cashfree_order_id);
        setQrValue(backendOrder.payment_session_id);
        setTimeLeft(180); // Reset timer
        setModalError("");
        setShowQrModal(true);

        /* ---------- CASHFREE GATEWAY FLOW (commented out) ----------
        // Cashfree flow: Use the Cashfree JS SDK to open the payment UI
        console.log("Cashfree payment_session_id:", backendOrder.payment_session_id);
        console.log("Cashfree order_id:", backendOrder.cashfree_order_id);
        setCfOrderId(backendOrder.cashfree_order_id);
        openCashfreeCheckout(backendOrder.payment_session_id);
        ------------------------------------------------------------ */

      } catch (err) {
        console.error(err);
        setErrorMsg("Payment failed. Try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <Header />

      <div className="pay-page-wrapper">

        {/* ── Page Header ── */}
        <div className="pay-page-hero">
          <button className="pay-back-btn" onClick={() => navigate(-1)} disabled={isLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
          </button>
          <div>
            <h1 className="pay-page-title">Checkout</h1>
            <p className="pay-page-sub">Choose how you'd like to pay</p>
          </div>
          <div className="pay-secure-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Secure
          </div>
        </div>

        <div className="pay-page-body">

          {/* ── Wallet Balance Chip ── */}
          <div className="wallet-balance-card">
            <div className="wbc-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
              </svg>
            </div>
            <div className="wbc-info">
              <span className="wbc-label">Wallet Balance</span>
              <span className="wbc-amount">₹ {walletBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Payment Method Selector ── */}
          <div className="pay-method-section">
            <p className="pay-section-label">Payment Method</p>
            <div className="pay-method-grid">
              {paymentMethods.map(({ label, icon }) => (
                <button
                  key={label}
                  className={`pay-method-card ${selectedMethod === label ? "active" : ""}`}
                  onClick={() => setSelectedMethod(label)}
                  disabled={isLoading}
                >
                  <div className="pmc-icon">{icon}</div>
                  <span className="pmc-label">{label}</span>
                  {selectedMethod === label && (
                    <div className="pmc-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="order-summary-card">
            <div className="osc-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span>Order Summary</span>
            </div>

            {!cartItems.length ? (
              <p className="empty-cart-msg">No items in cart</p>
            ) : (
              <>
                <div className="osc-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="osc-item-row">
                      <div className="osc-item-info">
                        <span className="osc-item-name">{item.name}</span>
                        <span className="osc-item-qty">× {item.quantity}</span>
                      </div>
                      <span className="osc-item-price">₹ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="osc-divider" />
                <div className="osc-total-row">
                  <span>Total Payable</span>
                  <strong>₹ {calculateTotalAmount().toFixed(2)}</strong>
                </div>
              </>
            )}
          </div>

          {/* ── Error ── */}
          {errorMsg && (
            <div className="pay-error-msg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {errorMsg}
            </div>
          )}

          {/* ── CTA Buttons ── */}
          <div className="pay-cta-section">
            <button
              className={`pay-confirm-btn ${isLoading ? "loading" : ""}`}
              onClick={handleConfirmPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className="pay-spinner" /> Processing…</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  Pay ₹ {calculateTotalAmount().toFixed(2)}
                </>
              )}
            </button>
            <button
              className="pay-cancel-btn"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>

      {showQrModal && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-card">

            {/* Header */}
            <div className="qr-modal-header">
              <div className="qr-brand-badge">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M6 21h7.5L18.5 11H11L6 21z" fill="#097939" />
                  <path d="M13.5 21l5-10H26l-5 10H13.5z" fill="#ED7D31" />
                </svg>
                <span>UPI</span>
              </div>
              <h2 className="qr-modal-title">Scan &amp; Pay</h2>
              <p className="qr-modal-subtitle">Use any UPI app to scan and pay instantly</p>
            </div>

            {/* QR Code */}
            <div className="qr-code-wrapper">
              <div className="qr-code-inner">
                <QRCodeCanvas value={qrValue} size={180} includeMargin={false} level="H" />
              </div>
              <div className="qr-scan-hint">
                <span className="qr-scan-dot" />
                <span>Point camera to scan</span>
              </div>
            </div>

            {/* Merchant & Amount */}
            <div className="qr-merchant-row">
              <div className="qr-merchant-info">
                <span className="qr-merchant-label">Paying to</span>
                <span className="qr-merchant-name">{getPayeeName()}</span>
              </div>
              <div className="qr-amount-chip">₹{calculateTotalAmount().toFixed(2)}</div>
            </div>

            {/* Desktop warning */}
            {modalError && (
              <div className="modal-error-callout">
                ⚠️ {modalError}
              </div>
            )}

            {/* UPI App Buttons */}
            <div className="upi-payment-section">
              <p className="upi-section-title">Pay directly via app</p>
              <div className="upi-apps-row">

                {/* Generic UPI */}
                <a href={qrValue} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "generic")}>
                  <div className="upi-icon-wrapper generic-upi">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <path d="M6 21h7.5L18.5 11H11L6 21z" fill="#097939" />
                      <path d="M13.5 21l5-10H26l-5 10H13.5z" fill="#ED7D31" />
                    </svg>
                  </div>
                  <span>Any UPI</span>
                </a>

                {/* Google Pay */}
                <a href={getAppUpiLink("gpay")} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "gpay")}>
                  <div className="upi-icon-wrapper gpay">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <path d="M16.5 14.5c0-.8-.1-1.6-.3-2.3H9v4.4h4.2c-.2.9-.7 1.7-1.5 2.2v2.8h2.4c1.4-1.3 2.4-3.2 2.4-7.1z" fill="#4285F4" />
                      <path d="M9 22c1.8 0 3.3-.6 4.4-1.6l-2.4-2.8c-.7.5-1.5.8-2 .8-1.6 0-3-1.1-3.5-2.6H1.9v2.9C3.1 20 5.8 22 9 22z" fill="#34A853" />
                      <path d="M5.5 15.8C5.4 15.3 5.3 14.7 5.3 14c0-.7.1-1.3.2-1.8V9.3H1.9C1.3 10.7 1 12.3 1 14c0 1.7.3 3.3.9 4.7l3.6-2.9z" fill="#FBBC05" />
                      <path d="M9 6.2c1 0 1.9.3 2.6 1l2-2C12.3 4 10.8 3.5 9 3.5 5.8 3.5 3.1 5.5 1.9 8.2l3.6 2.9c.5-1.5 1.9-2.6 3.5-2.6z" fill="#EA4335" />
                    </svg>
                  </div>
                  <span>GPay</span>
                </a>

                {/* PhonePe */}
                <a href={getAppUpiLink("phonepe")} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "phonepe")}>
                  <div className="upi-icon-wrapper phonepe">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <text x="16" y="22" fill="#fff" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="16" textAnchor="middle">पे</text>
                    </svg>
                  </div>
                  <span>PhonePe</span>
                </a>

                {/* Paytm */}
                <a href={getAppUpiLink("paytm")} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "paytm")}>
                  <div className="upi-icon-wrapper paytm">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <text x="16" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="9" textAnchor="middle">
                        <tspan fill="#00baf2">pay</tspan><tspan fill="#002b5c">tm</tspan>
                      </text>
                    </svg>
                  </div>
                  <span>Paytm</span>
                </a>

              </div>
            </div>

            {/* Timer & Cancel */}
            <div className="qr-footer">
              <div className="qr-timer-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <span>Expires in </span>
                <span className="timer-count">{formatTime(timeLeft)}</span>
              </div>
              <button className="qr-close-btn" onClick={() => setShowQrModal(false)}>
                ✕ Cancel Payment
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
