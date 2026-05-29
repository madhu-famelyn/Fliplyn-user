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
  const [qrValue, setQrValue] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [cfOrderId, setCfOrderId] = useState("");

  const getAppUpiLink = (app) => {
    return qrValue;
  };

  const [modalError, setModalError] = useState("");

  const handleUpiAppClick = (e, app) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
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
        const url = `${API_BASE}/orders/verify-payment/cashfree/${cfOrderId}`;
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

  /* ---------------- CASHFREE ---------------- */
  // eslint-disable-next-line no-unused-vars
  const openCashfreeCheckout = (paymentSessionId) => {
    if (!window.Cashfree) {
      setErrorMsg("Cashfree SDK not loaded");
      return;
    }

    const cashfree = new window.Cashfree({
      mode: "production", // MUST MATCH BACKEND
    });

    cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });
  };

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

        // PhonePe flow: Show the beautiful QR modal on screen and allow the user to scan & pay!
        if (!backendOrder.payment_session_id) {
          setErrorMsg("Failed to generate payment QR code");
          return;
        }
        console.log("PhonePe Dynamic QR String generated:", backendOrder.payment_session_id);
        setQrValue(backendOrder.payment_session_id);
        setCfOrderId(backendOrder.cashfree_order_id);
        setTimeLeft(180); // Reset timer to 180 seconds
        setModalError(""); // Clear any previous error
        setShowQrModal(true);

        // Auto-redirect if mobile
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = backendOrder.payment_session_id;
        }

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

      <div className="payment-page-container">
        <h2 className="payment-title">Payment</h2>

        <div className="payment-methods">
          {paymentMethods.map(({ label, icon }) => (
            <button
              key={label}
              className={`method-btn ${selectedMethod === label ? "selected" : ""
                }`}
              onClick={() => setSelectedMethod(label)}
              disabled={isLoading}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <p className="wallet-balance-text">
          Wallet Balance: <strong>₹ {walletBalance.toFixed(2)}</strong>
        </p>

        <div className="cart-summary-box">
          <h3 className="cart-title">Cart Items</h3>

          {!cartItems.length ? (
            <p className="empty-cart-msg">No items in cart</p>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item-row">
                  <span>{item.name}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>₹ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="cart-total-row">
                <strong>Total:</strong>
                <strong>₹ {calculateTotalAmount().toFixed(2)}</strong>
              </div>
            </>
          )}
        </div>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <div className="payment-buttons">
          <button
            className="confirm-btn"
            onClick={handleConfirmPayment}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm Payment"}
          </button>

          <button
            className="continue-btn"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>

      {showQrModal && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-card">
            <h2>Scan & Pay</h2>
            <p>Scan using any UPI App (GPay, PhonePe, Paytm)</p>
            <div className="qr-canvas-container">
              <QRCodeCanvas value={qrValue} size={200} includeMargin={true} level="H" />
            </div>
            <p className="payee-name-sub">Paying to: <strong>{getPayeeName()}</strong></p>
            <p className="qr-amount">Amount: ₹{calculateTotalAmount().toFixed(2)}</p>

            {modalError && (
              <div className="modal-error-callout" style={{
                background: "#fff9db",
                border: "1px solid #ffe066",
                color: "#856404",
                padding: "10px 14px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "16px",
                textAlign: "left",
                lineHeight: "1.4"
              }}>
                ⚠️ {modalError}
              </div>
            )}

            <div className="upi-payment-section">
              <p className="upi-section-title">Pay Via UPI</p>
              <div className="upi-apps-row">
                {/* Generic UPI */}
                <a href={qrValue} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "generic")}>
                  <div className="upi-icon-wrapper generic-upi">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M6 21h7.5L18.5 11H11L6 21z" fill="#097939" />
                      <path d="M13.5 21l5-10H26l-5 10H13.5z" fill="#ED7D31" />
                    </svg>
                  </div>
                  <span>Pay by any UPI</span>
                </a>

                {/* Google Pay */}
                <a href={getAppUpiLink("gpay")} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "gpay")}>
                  <div className="upi-icon-wrapper gpay">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16.5 14.5c0-.8-.1-1.6-.3-2.3H9v4.4h4.2c-.2.9-.7 1.7-1.5 2.2v2.8h2.4c1.4-1.3 2.4-3.2 2.4-7.1z" fill="#4285F4" />
                      <path d="M9 22c1.8 0 3.3-.6 4.4-1.6l-2.4-2.8c-.7.5-1.5.8-2 .8-1.6 0-3-1.1-3.5-2.6H1.9v2.9C3.1 20 5.8 22 9 22z" fill="#34A853" />
                      <path d="M5.5 15.8C5.4 15.3 5.3 14.7 5.3 14c0-.7.1-1.3.2-1.8V9.3H1.9C1.3 10.7 1 12.3 1 14c0 1.7.3 3.3.9 4.7l3.6-2.9z" fill="#FBBC05" />
                      <path d="M9 6.2c1 0 1.9.3 2.6 1l2-2C12.3 4 10.8 3.5 9 3.5 5.8 3.5 3.1 5.5 1.9 8.2l3.6 2.9c.5-1.5 1.9-2.6 3.5-2.6z" fill="#EA4335" />
                    </svg>
                  </div>
                  <span>Google Pay</span>
                </a>

                {/* PhonePe */}
                <a href={getAppUpiLink("phonepe")} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "phonepe")}>
                  <div className="upi-icon-wrapper phonepe">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <text x="16" y="22" fill="#fff" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16" textAnchor="middle">पे</text>
                    </svg>
                  </div>
                  <span>PhonePe</span>
                </a>

                {/* Paytm */}
                <a href={getAppUpiLink("paytm")} className="upi-app-btn" onClick={(e) => handleUpiAppClick(e, "paytm")}>
                  <div className="upi-icon-wrapper paytm">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <text x="16" y="20" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="9" textAnchor="middle">
                        <tspan fill="#00baf2">pay</tspan><tspan fill="#002b5c">tm</tspan>
                      </text>
                    </svg>
                  </div>
                  <span>Paytm</span>
                </a>
              </div>
            </div>

            <p className="qr-timer-text">Expires in: <span className="timer-count">{formatTime(timeLeft)}</span></p>

            <button className="qr-close-btn" onClick={() => setShowQrModal(false)}>Cancel Payment</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
