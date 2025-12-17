import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";
import "./Wallet.css";
import { FaWallet } from "react-icons/fa";
import { SiPhonepe } from "react-icons/si";
import { useAuth } from "../../AuthContext/ContextApi";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://admin-aged-field-2794.fly.dev";

export default function PaymentMethodPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [selectedMethod, setSelectedMethod] = useState("Wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const paymentMethods = [
    { label: "Wallet", icon: <FaWallet /> },
    { label: "Payment Gateway", icon: <SiPhonepe /> },
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(stored);
  }, []);

  useEffect(() => {
    if (!userId || !token) return;
    const fetchWallet = async () => {
      try {
        const walletRes = await axios.get(`${API_BASE}/wallets/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWalletBalance(walletRes.data?.balance_amount || 0);
      } catch (err) {
        console.error("Wallet fetch error:", err);
      }
    };
    fetchWallet();
  }, [userId, token]);

  const calculateTotalAmount = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const createInternalOrder = async (orderPayload) => {
    const res = await axios.post(`${API_BASE}/orders/place`, orderPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const openCashfreeCheckout = (paymentSessionId) => {
    if (!window.Cashfree) {
      setErrorMsg("Cashfree SDK not loaded");
      return;
    }

    const cashfree = new window.Cashfree({
      mode: "sandbox", // change to "production" later
    });

    cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });
  };

  const handleConfirmPayment = async () => {
    setErrorMsg("");

    if (!userId || !user?.phone_number || !user?.email) {
      setErrorMsg("User phone/email missing — update profile");
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

    // ✅ WALLET FLOW — UNCHANGED
    if (selectedMethod === "Wallet") {
      if (totalAmount > walletBalance) {
        setErrorMsg("Insufficient Wallet Balance");
        return;
      }

      try {
        setIsLoading(true);
        const res = await createInternalOrder(orderPayload);
        localStorage.removeItem("cartItems");
        navigate("/success", { state: { order: res } });
      } catch (err) {
        setErrorMsg(err?.response?.data?.detail || "Order Failed");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ✅ CASHFREE PAYMENT GATEWAY FLOW
    if (selectedMethod === "Payment Gateway") {
      try {
        setIsLoading(true);

        // 1️⃣ Create internal order
        const backendOrder = await createInternalOrder(orderPayload);
        console.log("Internal order created:", backendOrder);

        // 2️⃣ Open Cashfree Checkout using payment_session_id
        if (!backendOrder.payment_session_id) {
          setErrorMsg("Payment session not created");
          return;
        }

        openCashfreeCheckout(backendOrder.payment_session_id);
      } catch (err) {
        console.error("Cashfree payment error:", err);
        setErrorMsg("Payment failed, please try again");
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
              className={`method-btn ${
                selectedMethod === label ? "selected" : ""
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

          {cartItems.length === 0 ? (
            <p className="empty-cart-msg">No items in cart</p>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item-row">
                  <span>{item.name}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
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
    </>
  );
}
