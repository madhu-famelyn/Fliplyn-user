import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import axios from "axios";

function OrderingCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ loader state

  const email = localStorage.getItem("customerEmail");

  useEffect(() => {
    if (!email) return;

    const storedCart = JSON.parse(localStorage.getItem("cart")) || {};
    let userCart = storedCart[email] || [];

    userCart = userCart.map((item) => ({
      ...item,
      qty: item.qty ? item.qty : 1,
      price: item.final_price || item.price,
    }));

    setCart(userCart);
  }, [email]);

  const saveCart = (updatedCart) => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || {};
    storedCart[email] = updatedCart;
    localStorage.setItem("cart", JSON.stringify(storedCart));
  };

  const increaseQty = (id) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    setCart(updated);
    saveCart(updated);
  };

  const decreaseQty = (id) => {
    const updated = cart
      .map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0);

    setCart(updated);
    saveCart(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    saveCart(updated);
  };

  const total = cart
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);

  // ✅ PAYMENT HANDLER WITH LOADER
  const handlePayment = async () => {
    if (loading) return; // 🚫 prevent double click

    try {
      if (!email) {
        alert("User not logged in");
        return;
      }

      setLoading(true); // ✅ start loader

      const orderItems = cart.map((item) => ({
        item_id: item.id,
        quantity: item.qty,
      }));

      const payload = {
        user_email: email,
        items: orderItems,
      };

      const res = await axios.post(
        "https://admin-aged-field-2794.fly.dev/cashfree-orders/",
        payload
      );

      const data = res.data;

      localStorage.setItem("last_order_id", data.id);

      if (!window.Cashfree) {
        alert("Cashfree SDK not loaded");
        setLoading(false);
        return;
      }

      const cashfree = new window.Cashfree({
        mode: "production",
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
      });

      alert("✅ Payment Successful!");

      setCart([]);
      saveCart([]);
    } catch (err) {
      console.error("❌ Payment error:", err);
      alert("Payment failed");
    } finally {
      setLoading(false); // ✅ stop loader ALWAYS
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <span className="back" onClick={() => navigate(-1)}>
          ← Back
        </span>
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
    </div>
  );
}

export default OrderingCart;