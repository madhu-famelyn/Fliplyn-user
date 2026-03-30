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

  // ✅ NEW STATES
  const [showAlert, setShowAlert] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

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
    if (cart.length === 0) {
      const updatedCart = [{ ...item, stall_id: item.stall_id || stallId }];
      setCart(updatedCart);
      saveCart(updatedCart);
      return;
    }

    const existingStallId = cart[0].stall_id;

    // ❌ Different stall → show popup
    if (existingStallId !== (item.stall_id || stallId)) {
      setPendingItem(item);
      setShowAlert(true);
      return;
    }

    const exists = cart.find((i) => i.id === item.id);

    if (!exists) {
      const updatedCart = [
        ...cart,
        { ...item, stall_id: item.stall_id || stallId },
      ];
      setCart(updatedCart);
      saveCart(updatedCart);
    }
  };

  // ✅ Handle clear + add new item
  const handleClearAndAdd = () => {
    const updatedCart = [
      { ...pendingItem, stall_id: pendingItem.stall_id || stallId },
    ];
    setCart(updatedCart);
    saveCart(updatedCart);
    setShowAlert(false);
    setPendingItem(null);
  };

  const isInCart = (id) => {
    return cart.some((item) => item.id === id);
  };

  const total = cart
    .reduce((sum, i) => sum + (i.final_price || i.price), 0)
    .toFixed(2);

  return (
    <div className="menu-container">
      {/* Header */}
      <div className="header">
        <span className="back" onClick={() => navigate(-1)}>
          ← Back
        </span>
        <h1>Menu</h1>
      </div>

      {loading && <p>Loading items...</p>}
      {!loading && items.length === 0 && <p>No items found</p>}

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

      {/* Cart Bar */}
      {cart.length > 0 && (
        <div
          className="cart-bar"
          onClick={() => navigate("/ordering-cart")}
        >
          <span>{cart.length} items</span>
          <span>₹{total}</span>
        </div>
      )}

      {/* ✅ CUSTOM POPUP */}
      {showAlert && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>⚠️ Different Stall</h3>
            <p>
              Your cart contains items from another stall. Clear cart to add
              this item.
            </p>

            <div className="popup-actions">
              <button
                className="popup-cancel"
                onClick={() => setShowAlert(false)}
              >
                Cancel
              </button>

              <button
                className="popup-confirm"
                onClick={handleClearAndAdd}
              >
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage;