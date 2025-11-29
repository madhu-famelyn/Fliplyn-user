import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Header/Header';
import './Wallet.css';
import { FaWallet } from 'react-icons/fa';
import { SiPhonepe } from 'react-icons/si';
import { useAuth } from '../../AuthContext/ContextApi';
import { useNavigate } from 'react-router-dom';

const API_BASE = "https://admin-aged-field-2794.fly.dev";

export default function PaymentMethodPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [selectedMethod, setSelectedMethod] = useState('Wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const paymentMethods = [
    { label: 'Wallet', icon: <FaWallet /> },
    { label: 'Payment Gateway', icon: <SiPhonepe /> },
  ];

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Load cart
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(stored);
  }, []);

  // Fetch wallet only (NO user API)
  useEffect(() => {
    if (!userId || !token) return;

    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API_BASE}/wallets/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWalletBalance(res.data?.balance_amount || 0);
      } catch (err) {
        console.error("❌ Wallet Error:", err?.response?.data || err);
      }
    };

    fetchWallet();
  }, [userId, token]);

  const calculateTotalAmount = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // MAIN PAYMENT
  const handleConfirmPayment = async () => {
    setErrorMsg("");

    if (!userId || cartItems.length === 0) {
      setErrorMsg("Invalid user or cart.");
      return;
    }

    const totalAmount = calculateTotalAmount();
    const itemsPayload = cartItems.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    // ⭐ Take email & phone from context container
    const orderPayload = {
      user_id: userId,
      user_phone: user?.phone_number,
      user_email: user?.company_email,
      items: itemsPayload,
      pay_with_wallet: selectedMethod === 'Wallet',
    };

    if (!orderPayload.user_phone || !orderPayload.user_email) {
      setErrorMsg("Phone/email missing — update profile");
      return;
    }

    console.log("📦 FINAL ORDER PAYLOAD:", orderPayload);

    // ---------------- WALLET PAYMENT ----------------
    if (selectedMethod === "Wallet") {
      if (totalAmount > walletBalance) {
        setErrorMsg("Insufficient Wallet Balance");
        return;
      }

      try {
        setIsLoading(true);
        const res = await axios.post(`${API_BASE}/orders/place`, orderPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.removeItem("cartItems");
        navigate('/success', { state: { order: res.data } });
      } catch (err) {
        setErrorMsg(err?.response?.data?.detail || "Order Failed");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ---------------- PAYMENT GATEWAY ----------------
    if (selectedMethod === "Payment Gateway") {
      try {
        setIsLoading(true);

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) return setErrorMsg("Failed to load Razorpay");

        const orderRes = await axios.post(`${API_BASE}/orders/place`, orderPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const backendOrder = orderRes.data;
        const rzpOrderId = backendOrder.razorpay_order_id;

        const options = {
          key: "rzp_live_RhsVZO1LTfyhqQ",
          amount: backendOrder.total_amount * 100,
          currency: "INR",
          name: "My App",
          description: "Order Payment",
          order_id: rzpOrderId,

          handler: async function (response) {
            try {
              await axios.post(`${API_BASE}/orders/verify-payment`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });

              localStorage.removeItem("cartItems");
              navigate('/success', { state: { order: backendOrder } });
            } catch {
              setErrorMsg("Payment verification failed");
            }
          },

          prefill: {
            name: user?.name || "",
            email: orderPayload.user_email,
            contact: orderPayload.user_phone,
          },
          theme: { color: "#0d6efd" },
        };

        new window.Razorpay(options).open();
      } catch (err) {
        console.error("❌ Razorpay Error:", err?.response?.data || err);
        setErrorMsg("Payment failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="payment-page-container">
        <h2 className="payment-title">Payment</h2>

        <div className="payment-methods">
          {paymentMethods.map(({ label, icon }) => (
            <button
              key={label}
              className={`method-btn ${selectedMethod === label ? 'selected' : ''}`}
              onClick={() => setSelectedMethod(label)}
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

          {cartItems.length === 0 ? (
            <p className="empty-cart-msg">No items in cart</p>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item-row">
                  <span>{item.name}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
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
          <button className="continue-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
