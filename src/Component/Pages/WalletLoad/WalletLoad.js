import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/ContextApi";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { QRCodeCanvas } from "qrcode.react";
import { SiPhonepe } from "react-icons/si";
import "./WalletLoad.css";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.") ||
  window.location.hostname.startsWith("172.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:8000`
  : "https://admin-aged-field-2794.fly.dev";

export default function WalletLoadPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [walletBalance, setWalletBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // QR / UPI state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [currentTxnId, setCurrentTxnId] = useState("");
  const [loadAmount, setLoadAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [modalError, setModalError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(""); // "SUCCESS" | "FAILED" | ""

  const isNavigatingRef = useRef(false);
  const pollingRef = useRef(null);

  // ── Fetch wallet balance ──
  useEffect(() => {
    if (!userId || !token) return;
    axios
      .get(`${API_BASE}/wallets/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWalletBalance(res.data?.balance_amount || 0))
      .catch(() => {});
  }, [userId, token]);

  // ── Countdown timer ──
  useEffect(() => {
    if (!showQrModal) return;
    if (timeLeft <= 0) {
      setShowQrModal(false);
      setErrorMsg("Payment session expired. Please try again.");
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [showQrModal, timeLeft]);

  // ── Poll payment status ──
  useEffect(() => {
    if (!currentTxnId) return;
    isNavigatingRef.current = false;

    const check = async () => {
      if (isNavigatingRef.current) return;
      try {
        const res = await axios.get(
          `${API_BASE}/wallet/load/status/${currentTxnId}`
        );
        const status = res.data?.status;
        if (status === "SUCCESS") {
          if (isNavigatingRef.current) return;
          isNavigatingRef.current = true;
          clearInterval(pollingRef.current);
          setShowQrModal(false);
          setPaymentStatus("SUCCESS");
          // Refresh balance
          const walRes = await axios.get(`${API_BASE}/wallets/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setWalletBalance(walRes.data?.balance_amount || 0);
          if (userId)
            localStorage.setItem(
              `cached_wallet_${userId}`,
              (walRes.data?.balance_amount || 0).toString()
            );
        } else if (status === "FAILED") {
          clearInterval(pollingRef.current);
          setShowQrModal(false);
          setPaymentStatus("FAILED");
        }
      } catch {}
    };

    check();
    pollingRef.current = setInterval(check, 1500);

    const onFocus = () => {
      if (!isNavigatingRef.current) check();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(pollingRef.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [currentTxnId, userId, token]);

  // ── Helpers ──
  const getAmount = () => {
    const n = parseFloat(customAmount);
    return isNaN(n) ? 0 : n;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const getAppUpiLink = (app) => {
    if (!qrValue) return qrValue;
    const upiParams = qrValue.replace(/^upi:\/\/pay\?/, "");
    switch (app) {
      case "phonepe": return `phonepe://pay?${upiParams}`;
      case "gpay": return `tez://upi/pay?${upiParams}`;
      case "paytm": return `paytmmp://pay?${upiParams}`;
      default: return qrValue;
    }
  };

  const handleUpiAppClick = (e, app) => {
    e.preventDefault();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = getAppUpiLink(app);
    } else {
      const names = { gpay: "Google Pay", phonepe: "PhonePe", paytm: "Paytm" };
      setModalError(
        `To pay via ${names[app] || "UPI"} on a laptop, please scan the QR code above!`
      );
    }
  };

  // ── Initiate Wallet Load ──
  const handleAddMoney = async () => {
    const amount = getAmount();
    setErrorMsg("");
    setPaymentStatus("");

    if (!amount || amount < 1) {
      setErrorMsg("Minimum amount is ₹1");
      return;
    }
    if (amount > 10000) {
      setErrorMsg("Maximum amount is ₹10,000 per transaction");
      return;
    }
    if (!userId) {
      setErrorMsg("Please login to continue");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/wallet/load/initiate`, {
        user_id: userId,
        amount,
      });

      const { merchant_txn_id, intent_string } = res.data;
      setCurrentTxnId(merchant_txn_id);
      setQrValue(intent_string);
      setLoadAmount(amount);
      setTimeLeft(300);
      setModalError("");
      isNavigatingRef.current = false;
      setShowQrModal(true);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.detail || "Failed to initiate wallet load"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──
  return (
    <>
      <Header />
      <div className="wl-page-wrapper">

        {/* ── Hero ── */}
        <div className="wl-hero">
          <button className="wl-back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
          </button>
          <div>
            <h1 className="wl-title">Add Money</h1>
            <p className="wl-subtitle">Top up your Fliplyn wallet instantly</p>
          </div>
          <div className="wl-secure-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            Secure
          </div>
        </div>

        <div className="wl-body">

          {/* ── Current Balance Card ── */}
          <div className="wl-balance-card">
            <div className="wl-balance-bg-circle" />
            <div className="wl-balance-content">
              <div className="wl-balance-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="3" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              </div>
              <div className="wl-balance-info">
                <span className="wl-balance-label">Current Balance</span>
                <span className="wl-balance-amount">₹ {walletBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── SUCCESS State ── */}
          {paymentStatus === "SUCCESS" && (
            <div className="wl-success-banner">
              <div className="wl-success-icon">✓</div>
              <div>
                <p className="wl-success-title">₹{loadAmount.toFixed(2)} added successfully!</p>
                <p className="wl-success-sub">Your wallet has been credited.</p>
              </div>
            </div>
          )}

          {/* ── FAILED State ── */}
          {paymentStatus === "FAILED" && (
            <div className="wl-failed-banner">
              <span>✕</span>
              <span>Payment failed. Please try again.</span>
            </div>
          )}

          {/* ── Custom Amount ── */}
          <div className="wl-section">
            <p className="wl-section-label">Enter amount</p>
            <div className="wl-input-wrapper">
              <span className="wl-input-prefix">₹</span>
              <input
                id="custom-amount-input"
                type="number"
                className="wl-amount-input"
                placeholder="Enter amount (₹1 – ₹10,000)"
                value={customAmount}
                min={1}
                max={10000}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setErrorMsg("");
                  setPaymentStatus("");
                }}
              />
            </div>
            <p className="wl-input-hint">Min ₹1 · Max ₹10,000 per transaction</p>
          </div>

          {/* ── Summary ── */}
          {getAmount() > 0 && (
            <div className="wl-summary-card">
              <div className="wl-summary-row">
                <span>Amount to add</span>
                <span>₹ {getAmount().toFixed(2)}</span>
              </div>
              <div className="wl-summary-row">
                <span>Transaction fee</span>
                <span className="wl-free-tag">FREE</span>
              </div>
              <div className="wl-summary-divider" />
              <div className="wl-summary-row wl-summary-total">
                <span>Total payable</span>
                <strong>₹ {getAmount().toFixed(2)}</strong>
              </div>
              <div className="wl-summary-row wl-summary-after">
                <span>Balance after top-up</span>
                <span className="wl-after-amount">₹ {(walletBalance + getAmount()).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {errorMsg && (
            <div className="wl-error-msg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* ── Pay via PhonePe Button ── */}
          <div className="wl-cta-section">
            <button
              id="add-money-btn"
              className={`wl-pay-btn ${isLoading ? "loading" : ""}`}
              onClick={handleAddMoney}
              disabled={isLoading || !getAmount()}
            >
              {isLoading ? (
                <><span className="wl-spinner" /> Processing…</>
              ) : (
                <>
                  <SiPhonepe size={20} />
                  {getAmount() > 0
                    ? `Add ₹${getAmount().toFixed(2)} via PhonePe`
                    : "Select an Amount"}
                </>
              )}
            </button>
            <button className="wl-cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>

        </div>
      </div>

      {/* ── QR Modal ── */}
      {showQrModal && (
        <div
          className="wl-qr-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false);
          }}
        >
          <div className="wl-qr-card">
            {/* Top Close Button */}
            <button
              className="wl-qr-top-close-btn"
              onClick={() => setShowQrModal(false)}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div className="wl-qr-header">
              <div className="wl-qr-brand">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M6 21h7.5L18.5 11H11L6 21z" fill="#097939" />
                  <path d="M13.5 21l5-10H26l-5 10H13.5z" fill="#ED7D31" />
                </svg>
                <span>UPI</span>
              </div>
              <h2 className="wl-qr-title">Scan & Pay to Add Money</h2>
              <p className="wl-qr-subtitle">Use any UPI app to add ₹{loadAmount.toFixed(2)} to your wallet</p>
            </div>

            {/* QR Code */}
            <div className="wl-qr-code-wrapper">
              <div className="wl-qr-code-inner">
                <QRCodeCanvas value={qrValue} size={180} includeMargin={false} level="H" />
              </div>
              <div className="wl-qr-scan-hint">
                <span className="wl-qr-dot" />
                <span>Point camera to scan</span>
              </div>
            </div>

            {/* Amount chip */}
            <div className="wl-qr-amount-row">
              <span className="wl-qr-paying-label">Adding to wallet</span>
              <div className="wl-qr-amount-chip">₹{loadAmount.toFixed(2)}</div>
            </div>

            {/* Desktop hint */}
            {modalError && (
              <div className="wl-modal-error">⚠️ {modalError}</div>
            )}

            {/* UPI App Buttons */}
            <div className="wl-upi-section">
              <p className="wl-upi-title">Pay directly via app</p>
              <div className="wl-upi-apps-row">

                <a href={qrValue} className="wl-upi-app-btn" onClick={(e) => handleUpiAppClick(e, "generic")}>
                  <div className="wl-upi-icon generic-upi">
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                      <path d="M6 21h7.5L18.5 11H11L6 21z" fill="#097939" />
                      <path d="M13.5 21l5-10H26l-5 10H13.5z" fill="#ED7D31" />
                    </svg>
                  </div>
                  <span>Any UPI</span>
                </a>

                <a href={getAppUpiLink("gpay")} className="wl-upi-app-btn" onClick={(e) => handleUpiAppClick(e, "gpay")}>
                  <div className="wl-upi-icon gpay">
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                      <path d="M16.5 14.5c0-.8-.1-1.6-.3-2.3H9v4.4h4.2c-.2.9-.7 1.7-1.5 2.2v2.8h2.4c1.4-1.3 2.4-3.2 2.4-7.1z" fill="#4285F4" />
                      <path d="M9 22c1.8 0 3.3-.6 4.4-1.6l-2.4-2.8c-.7.5-1.5.8-2 .8-1.6 0-3-1.1-3.5-2.6H1.9v2.9C3.1 20 5.8 22 9 22z" fill="#34A853" />
                      <path d="M5.5 15.8C5.4 15.3 5.3 14.7 5.3 14c0-.7.1-1.3.2-1.8V9.3H1.9C1.3 10.7 1 12.3 1 14c0 1.7.3 3.3.9 4.7l3.6-2.9z" fill="#FBBC05" />
                      <path d="M9 6.2c1 0 1.9.3 2.6 1l2-2C12.3 4 10.8 3.5 9 3.5 5.8 3.5 3.1 5.5 1.9 8.2l3.6 2.9c.5-1.5 1.9-2.6 3.5-2.6z" fill="#EA4335" />
                    </svg>
                  </div>
                  <span>GPay</span>
                </a>

                <a href={getAppUpiLink("phonepe")} className="wl-upi-app-btn" onClick={(e) => handleUpiAppClick(e, "phonepe")}>
                  <div className="wl-upi-icon phonepe">
                    <SiPhonepe size={22} color="#5f259f" />
                  </div>
                  <span>PhonePe</span>
                </a>

                <a href={getAppUpiLink("paytm")} className="wl-upi-app-btn" onClick={(e) => handleUpiAppClick(e, "paytm")}>
                  <div className="wl-upi-icon paytm">
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                      <path d="M19.5 9.5h-3v13h3v-13z" fill="#002E6E" />
                      <path d="M26.5 9.5h-3v13h3v-13z" fill="#00BAF2" />
                    </svg>
                  </div>
                  <span>Paytm</span>
                </a>

              </div>
            </div>

            {/* Footer */}
            <div className="wl-qr-footer">
              <div className="wl-qr-timer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Expires in <strong style={{ color: timeLeft < 60 ? "#ef4444" : "#1e293b" }}>{formatTime(timeLeft)}</strong></span>
              </div>
              <button className="wl-qr-cancel-btn" onClick={() => setShowQrModal(false)}>
                ✕ Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
