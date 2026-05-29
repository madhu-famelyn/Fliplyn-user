import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import axios from "axios";
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

function OrderingCart() {

  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);

  const email = localStorage.getItem("customerEmail");

   const getAppUpiLink = (app) => {
     if (!qrValue) return "";
     const query = qrValue.replace(/^upi:\/\/pay\??/, "");
     const isAndroid = /Android/i.test(navigator.userAgent);
     const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

     if (isAndroid) {
       switch (app) {
         case "gpay":
           return `intent://pay?${query}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
         case "phonepe":
           return `intent://pay?${query}#Intent;scheme=upi;package=com.phonepe.app;end`;
         case "paytm":
           return `intent://pay?${query}#Intent;scheme=upi;package=net.one97.paytm;end`;
         default:
           return qrValue;
       }
     } else if (isIOS) {
       switch (app) {
         case "gpay":
           return `gpay://upi/pay?${query}`;
         case "phonepe":
           return `phonepe://pay?${query}`;
         case "paytm":
           return `paytmmp://pay?${query}`;
         default:
           return qrValue;
       }
     } else {
       return qrValue;
     }
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


  useEffect(() => {

    console.log("==== CART PAGE LOADED ====");

    if (!email) {
      console.log("No customer email found in localStorage");
      return;
    }

    console.log("Customer Email:", email);

    const storedCart = JSON.parse(localStorage.getItem("cart")) || {};
    console.log("Stored Cart Object:", storedCart);

    let userCart = storedCart[email] || [];
    console.log("User Cart Before Formatting:", userCart);

    userCart = userCart.map((item) => ({
      ...item,
      qty: item.qty ? item.qty : 1,
      price: item.final_price || item.price
    }));

    console.log("User Cart After Formatting:", userCart);

    setCart(userCart);

  }, [email]);

  useEffect(() => {
    if (!showQrModal || !qrValue) return;

    const token = sessionStorage.getItem("current_token");
    if (!token) return;

    console.log("=== STARTING QR STATUS POLLING ===");
    const intervalId = setInterval(async () => {
      try {
        const url = `${API_BASE}/cashfree-orders/by-token/${token}`;
        const res = await axios.get(url);
        if (res.data && res.data.payment_status === "SUCCESS") {
          console.log("=== PAYMENT DETECTED SUCCESS ===");
          clearInterval(intervalId);
          setShowQrModal(false);

          // Clear cart on successful order placement
          setCart([]);
          saveCart([]);

          navigate(`/ordering-success?token=${token}`);
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    }, 2500);

    return () => {
      console.log("=== CLEANING UP POLLING ===");
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQrModal, qrValue, navigate]);


  const saveCart = (updatedCart) => {

    console.log("Saving Updated Cart:", updatedCart);

    const storedCart = JSON.parse(localStorage.getItem("cart")) || {};
    storedCart[email] = updatedCart;

    localStorage.setItem("cart", JSON.stringify(storedCart));

  };


  const increaseQty = (id) => {

    console.log("Increasing Quantity for item:", id);

    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );

    setCart(updated);
    saveCart(updated);

  };


  const decreaseQty = (id) => {

    console.log("Decreasing Quantity for item:", id);

    const updated = cart
      .map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0);

    setCart(updated);
    saveCart(updated);

  };


  const removeItem = (id) => {

    console.log("Removing item:", id);

    const updated = cart.filter((item) => item.id !== id);

    setCart(updated);
    saveCart(updated);

  };


  const total = cart
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);


  const handlePayment = async () => {

    if (loading) {
      console.log("Payment already processing...");
      return;
    }

    try {

      console.log("==== STARTING PAYMENT ====");

      setLoading(true);

      const orderItems = cart.map((item) => ({
        item_id: item.id,
        quantity: item.qty
      }));

      console.log("Order Items:", orderItems);

      const payload = {
        user_email: email,
        items: orderItems
      };

      console.log("Payload sent to backend:", payload);

      const res = await axios.post(
        `${API_BASE}/cashfree-orders/`,
        payload
      );

      console.log("Backend Response:", res);

      const data = res.data;

      console.log("Parsed Backend Data:", data);

      const token = data.token_number;

      console.log("Generated Token:", token);

      sessionStorage.setItem("current_token", token);

      console.log("Token stored in sessionStorage");

      // Commented out Cashfree payment flow
      /*
      if (!window.Cashfree) {

        console.error("Cashfree SDK not loaded");
        alert("Cashfree SDK not loaded");

        setLoading(false);
        return;

      }

      console.log("Initializing Cashfree Checkout...");

      const cashfree = new window.Cashfree({
        mode: "production"
      });

      console.log("Payment Session ID:", data.payment_session_id);

      console.log("Opening Cashfree Checkout...");

      const checkoutResponse = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

      console.log("Checkout Response:", checkoutResponse);
      */

      // PhonePe flow: Show the beautiful QR modal on screen and allow the user to scan & pay!
      if (data.payment_session_id) {
        console.log("PhonePe Dynamic QR String generated:", data.payment_session_id);
        setQrValue(data.payment_session_id);
        setTimeLeft(180); // Reset timer to 180 seconds
        setModalError(""); // Clear any previous error
        setShowQrModal(true);
      } else {
        alert("Failed to generate payment QR code");
      }

    } catch (err) {

      console.error("Payment Error:", err);
      alert("Payment failed");

    } finally {

      setLoading(false);
      console.log("==== PAYMENT PROCESS FINISHED ====");

    }

  };


  return (

    <div className="cart-container">

      <div className="cart-header">
        <span className="back" onClick={() => navigate(-1)}>← Back</span>
        <h1>Your Cart</h1>
      </div>

      {cart.length === 0 && <p>Your cart is empty</p>}

      <div className="cart-list">

        {cart.map((item) => (

          <div key={item.id} className="cart-card">

            <div className="cart-top">
              <h3>{item.name}</h3>

              <button
                className="delete-btn"
                onClick={() => removeItem(item.id)}
              >
                🗑
              </button>

            </div>

            <span className="price">₹{item.price}</span>

            <div className="qty-row">

              <button onClick={() => decreaseQty(item.id)}>-</button>

              <span>{item.qty}</span>

              <button onClick={() => increaseQty(item.id)}>+</button>

            </div>

          </div>

        ))}

      </div>

      {cart.length > 0 && (

        <div className="cart-footer">

          <div>
            <p>Total</p>
            <h2>₹{total}</h2>
          </div>

          <button
            className={`pay-btn ${loading ? "loading" : ""}`}
            onClick={handlePayment}
            disabled={loading}
          >

            {loading ? <span className="spinner"></span> : "Proceed to Pay"}

          </button>

        </div>

      )}

      {showQrModal && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-card">
            <h2>Scan & Pay</h2>
            <p>Scan using any UPI App (GPay, PhonePe, Paytm)</p>
            <div className="qr-canvas-container">
              <QRCodeCanvas value={qrValue} size={200} includeMargin={true} level="H" />
            </div>
            <p className="payee-name-sub">Paying to: <strong>{getPayeeName()}</strong></p>
            <p className="qr-amount">Amount: ₹{total}</p>

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

    </div>

  );
}

export default OrderingCart;