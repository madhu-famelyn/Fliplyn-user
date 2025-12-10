import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../Header/Header";
import "./Wallet.css";
import { FaWallet } from "react-icons/fa";
import { SiPhonepe } from "react-icons/si";
import { useAuth } from "../../AuthContext/ContextApi";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://admin-aged-field-2794.fly.dev";
const RAZORPAY_KEY = "rzp_live_RhsVZO1LTfyhqQ"; // keep as-is, do NOT expose secret in frontend

export default function PaymentMethodPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [selectedMethod, setSelectedMethod] = useState("Wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const rzpRef = useRef(null); // store Razorpay instance if needed

  const paymentMethods = [
    { label: "Wallet", icon: <FaWallet /> },
    { label: "Payment Gateway", icon: <SiPhonepe /> },
  ];

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

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
        console.error("❌ Wallet fetch error:", err?.response?.data || err);
      }
    };
    fetchWallet();
  }, [userId, token]);

  const calculateTotalAmount = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Helper: persist pending payment (survives refresh)
  const setPendingPayment = (payload) =>
    localStorage.setItem("pendingPayment", JSON.stringify(payload));
  const clearPendingPayment = () => localStorage.removeItem("pendingPayment");
  const getPendingPayment = () =>
    JSON.parse(localStorage.getItem("pendingPayment") || "null");

  // Recover pending payment if user refreshes after starting checkout
  useEffect(() => {
    const pending = getPendingPayment();
    if (pending && pending.order_id) {
      console.info("Recovered pending payment:", pending);
      // optionally poll backend for payment status here or show UI to continue
    }
  }, []);

  const createInternalOrder = async (orderPayload) => {
    const res = await axios.post(`${API_BASE}/orders/place`, orderPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const createRazorpayOrderIfMissing = async (internalOrderId) => {
    // call create-razorpay-order — idempotent endpoint on backend should return existing if present
    const res = await axios.post(
      `${API_BASE}/orders/create-razorpay-order`,
      { order_id: internalOrderId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; // { razorpay_order_id, amount, currency }
  };

  const verifyPaymentOnBackend = async (payload) => {
    return axios.post(`${API_BASE}/orders/verify-payment`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const openRazorpayCheckout = async (backendOrder, rzpOrder) => {
    // backendOrder: object from /orders/place
    // rzpOrder: { razorpay_order_id, amount, currency } from /orders/create-razorpay-order

    const options = {
      key: RAZORPAY_KEY,
      amount: rzpOrder.amount, // paisa
      currency: rzpOrder.currency,
      name: "Fliplyn",
      description: "Order Payment",
      order_id: rzpOrder.razorpay_order_id,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone_number || "",
      },
      theme: { color: "#0d6efd" },
      // Called when payment succeeds in the checkout and sends signature+ids
      handler: async function (response) {
        // ---- LOG the three values you requested ----
        console.info("Razorpay handler response:", response);
        console.info("razorpay_order_id:", response.razorpay_order_id);
        console.info("razorpay_payment_id:", response.razorpay_payment_id);
        console.info("razorpay_signature:", response.razorpay_signature);
        // --------------------------------------------

        // Persist logs in localStorage (for debugging if needed)
        const debugLog = {
          timestamp: new Date().toISOString(),
          order_id: backendOrder.id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };
        localStorage.setItem(
          `rzpLog_${backendOrder.id}`,
          JSON.stringify(debugLog)
        );

        try {
          // call backend verify endpoint
          await verifyPaymentOnBackend({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // clear pending payment record
          clearPendingPayment();
          localStorage.removeItem("cartItems");
          navigate("/success", { state: { order: backendOrder } });
        } catch (err) {
          console.error("❌ verify-payment failed:", err?.response?.data || err);
          setErrorMsg(
            err?.response?.data?.detail || "Payment verification failed"
          );
        }
      },
      modal: {
        ondismiss: function () {
          // user closed the checkout modal — keep pending record and show message
          console.warn("Razorpay modal dismissed by user");
          setErrorMsg(
            "Payment window closed. If payment was completed, it may take a few seconds to reflect. We will reconcile via webhook."
          );
        },
      },
    };

    // Create Razorpay instance and attach failure listener
    const rzp = new window.Razorpay(options);
    rzpRef.current = rzp;

    // Listen for payment.failed events (not all flows trigger this, but safe to attach)
    rzp.on && rzp.on("payment.failed", function (response) {
      // The handler above is for successful flows. This event captures failures.
      console.error("Razorpay payment.failed event:", response);
      // log to localStorage as well
      localStorage.setItem(
        `rzpFail_${backendOrder.id}`,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          response,
        })
      );
      setErrorMsg("Payment failed. Please try another method or try again.");
    });

    // open checkout
    rzp.open();
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
      price: item.price,
    }));

    const orderPayload = {
      user_id: userId,
      user_phone: user.phone_number,
      user_email: user.email,
      items: itemsPayload,
      pay_with_wallet: selectedMethod === "Wallet",
    };

    // WALLET flow
    if (selectedMethod === "Wallet") {
      if (totalAmount > walletBalance) {
        setErrorMsg("Insufficient Wallet Balance");
        return;
      }
      try {
        setIsLoading(true);
        const res = await createInternalOrder(orderPayload);
        clearPendingPayment();
        localStorage.removeItem("cartItems");
        navigate("/success", { state: { order: res.data || res } });
      } catch (err) {
        setErrorMsg(err?.response?.data?.detail || "Order Failed");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // PAYMENT GATEWAY flow
    if (selectedMethod === "Payment Gateway") {
      try {
        setIsLoading(true);

        // Create internal order first (idempotent on backend if user retries)
        const backendOrder = await createInternalOrder(orderPayload);
        console.log("Internal order created:", backendOrder);

        // Ensure razorpay order exists (call create-razorpay-order — backend should return existing if present)
        let rzpOrder = null;
        if (backendOrder.razorpay_order_id) {
          // backend already created razorpay_order_id in /orders/place
          rzpOrder = {
            razorpay_order_id: backendOrder.razorpay_order_id,
            amount: Math.round(backendOrder.total_amount * 100),
            currency: "INR",
          };
        } else {
          // fallback: create razorpay order explicitly
          const createRzp = await createRazorpayOrderIfMissing(backendOrder.id);
          rzpOrder = {
            razorpay_order_id: createRzp.razorpay_order_id,
            amount: createRzp.amount,
            currency: createRzp.currency,
          };
        }

        // Save pending payment state (so reload won't lose it)
        setPendingPayment({
          order_id: backendOrder.id,
          razorpay_order_id: rzpOrder.razorpay_order_id,
          created_at: new Date().toISOString(),
        });

        // Log what we will open
        console.info("Opening Razorpay checkout with:", {
          internal_order_id: backendOrder.id,
          razorpay_order_id: rzpOrder.razorpay_order_id,
          amount_paisa: rzpOrder.amount,
        });

        // Ensure checkout script loaded
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setErrorMsg("Failed to load Razorpay checkout script");
          return;
        }

        // open checkout
        await openRazorpayCheckout(backendOrder, rzpOrder);
      } catch (err) {
        console.error("❌ Payment flow error:", err?.response?.data || err);
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
              className={`method-btn ${selectedMethod === label ? "selected" : ""}`}
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
          <button className="continue-btn" onClick={() => navigate(-1)} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
