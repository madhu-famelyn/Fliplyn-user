import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import axios from "axios";

function OrderingCart() {

  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("customerEmail");


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
        "https://admin-aged-field-2794.fly.dev/cashfree-orders/",
        payload
      );

      console.log("Backend Response:", res);

      const data = res.data;

      console.log("Parsed Backend Data:", data);

      const token = data.token_number;

      console.log("Generated Token:", token);

      sessionStorage.setItem("current_token", token);

      console.log("Token stored in sessionStorage");

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

    </div>

  );
}

export default OrderingCart;