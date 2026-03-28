import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "./MenuPage.css";

function MenuPage() {
  const { categoryId, stallId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackImage =
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092";

  const email = localStorage.getItem("customerEmail");

  // ✅ Load cart
  useEffect(() => {
    if (!email) return;

    const storedCart = JSON.parse(localStorage.getItem("cart")) || {};
    const userCart = storedCart[email] || [];

    setCart(userCart);
  }, [email]);

  // ✅ Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        let url = "";

        if (categoryId) {
          url = `https://admin-aged-field-2794.fly.dev/items/items/category/${categoryId}`;
        } else if (stallId) {
          url = `https://admin-aged-field-2794.fly.dev/items/stall/${stallId}`;
        }

        const res = await axios.get(url);
        setItems(res.data);
      } catch (err) {
        console.error("❌ Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [categoryId, stallId]);

  // ✅ Save cart
  const saveCart = (updatedCart) => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || {};
    storedCart[email] = updatedCart;
    localStorage.setItem("cart", JSON.stringify(storedCart));
  };

  // ✅ Add to cart
  const addToCart = (item) => {
    const exists = cart.find((i) => i.id === item.id);

    if (!exists) {
      const updatedCart = [...cart, item];
      setCart(updatedCart);
      saveCart(updatedCart);
    }
  };

  const isInCart = (id) => {
    return cart.some((item) => item.id === id);
  };

  const total = cart
    .reduce((sum, i) => sum + (i.final_price || i.price), 0)
    .toFixed(2);

  return (
    <div className="menu-container">
      {/* 🔙 Back */}
      <div className="header">
        <span className="back" onClick={() => navigate(-1)}>
          ← Back
        </span>
        <h1>Menu</h1>
      </div>

      {/* ⏳ Loading */}
      {loading && <p>Loading items...</p>}

      {/* ❌ Empty */}
      {!loading && items.length === 0 && <p>No items found</p>}

      {/* ✅ Items */}
      <div className="menu-list">
        {items.map((item) => {
          const added = isInCart(item.id);

          return (
            <div key={item.id} className="menu-card">
              <img
                src={item.image_url || fallbackImage}
                className="menu-image"
                alt={item.name}
              />

              <div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span className="price">
                  ₹{item.final_price || item.price}
                </span>
              </div>

              <button
                onClick={() => addToCart(item)}
                className={`add-btn ${added ? "added" : ""}`}
                disabled={added}
              >
                {added ? "✓" : "+"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 🛒 Cart Bar → NOW CLICKABLE */}
      {cart.length > 0 && (
        <div
          className="cart-bar"
          onClick={() => navigate("/ordering-cart")}
          style={{ cursor: "pointer" }}
        >
          <span>{cart.length} items</span>
          <span>₹{total}</span>
        </div>
      )}
    </div>
  );
}

export default MenuPage;