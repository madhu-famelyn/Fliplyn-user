import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../Category/Category.css";
import { useAuth } from "../../AuthContext/ContextApi";
import "./Items.css";
import { BiFoodTag } from "react-icons/bi"; // ✅ Food icon

const S3_BASE_URL = "https://fliplyn-assets.s3.ap-south-1.amazonaws.com/";

export default function ItemList({ items, itemsLoaded }) {
  const { user, token } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false); 


  const fetchCartItems = useCallback(async () => {
    try {
      const res = await axios.get(`https://admin-aged-field-2794.fly.dev/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const itemIds = res.data.items.map((item) => item.item_id);
      setCartItems(itemIds);
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  const handleAddToCart = async (itemId) => {
    if (!user || !user.id) {
      setPopupMessage("⚠️ Please log in to add items to your cart.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
      return;
    }

    const isInCart = cartItems.includes(itemId);
    if (isInCart) return;

    const payload = {
      user_id: user.id,
      items: [{ item_id: itemId, quantity: 1 }],
    };

    try {
      setIsLoading(true); // 🧊 Show freezer + loader

      await axios.post("https://admin-aged-field-2794.fly.dev/cart/add-multiple", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems([...cartItems, itemId]);
      setPopupMessage("✅ Item added to cart!");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.error("❌ Failed to add to cart:", err);

      const errorMsg =
        err.response?.data?.detail ||
        "❌ Failed to add item. Please try again.";
      setPopupMessage(errorMsg);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    } finally {
      setIsLoading(false); // ❄️ Hide freezer + loader
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "veg") return item.is_veg;
    if (filterType === "nonveg") return item.is_veg === false;
    return true;
  });

  return (
    <div className="items-section">
      {/* ✅ Popup Message */}
      {showPopup && <div className="cart-popup">{popupMessage}</div>}

      {/* ✅ Freezer Overlay + Loader */}
      {isLoading && (
        <div className="freezer-overlay">
          <div className="loader"></div>
          <p>Adding to cart...</p>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterType === "all" ? "active" : ""}`}
          onClick={() => setFilterType("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterType === "veg" ? "active" : ""}`}
          onClick={() => setFilterType("veg")}
        >
          Veg
        </button>
        <button
          className={`filter-btn ${filterType === "nonveg" ? "active" : ""}`}
          onClick={() => setFilterType("nonveg")}
        >
          Non-Veg
        </button>
      </div>

      {itemsLoaded && filteredItems.length === 0 ? (
        <p className="no-items-text">No items available for selected filter.</p>
      ) : (
        <div className="item-grid">
          {filteredItems.map((item) => {
            const isInCart = cartItems.includes(item.id);
            const foodTagColor = item.is_veg ? "green" : "red";

            return (
              <div key={item.id} className="item-card">
                <img
                  src={
                    item.image_url?.startsWith("http")
                      ? item.image_url
                      : `${S3_BASE_URL}${item.image_url}`
                  }
                  alt={item.name}
                  className="item-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/fallback-image.jpg";
                  }}
                />
                <div className="item-infermation">
                  <h4 className="item-names">
                    <BiFoodTag
                      style={{ color: foodTagColor, marginRight: "4px" }}
                    />
                    {item.name}
                  </h4>

                  <p className="item-prices">
                    ₹
                    {item.price
                      ? item.price.toFixed(2)
                      : (
                          item.price +
                          item.price * (item.Gst_precentage / 100)
                        ).toFixed(2)}
                  </p>

                  <button
                    className={`add-to-cart-btn ${isInCart ? "added" : ""}`}
                    onClick={() => handleAddToCart(item.id)}
                    disabled={isLoading}
                  >
                    {isInCart ? "Item Added" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
