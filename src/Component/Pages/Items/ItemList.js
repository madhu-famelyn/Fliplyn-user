import React, { useState, useEffect, useCallback } from "react";
import "../Category/Category.css";
import "./Items.css";
import { useAuth } from "../../AuthContext/ContextApi";
import { FiSearch } from "react-icons/fi";

const S3_BASE_URL = "https://fliplyn-assets.s3.ap-south-1.amazonaws.com/";
const FOOD_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' style='background:%23f8fafc;width:100%25;height:100%25;'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>";
const COMBO_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100%25' height='100%25'><rect width='100' height='100' fill='%23fff7ed'/><circle cx='50' cy='46' r='30' fill='%23ffedd5'/><text x='50' y='52' font-size='28' text-anchor='middle' dominant-baseline='middle'>🍱</text><text x='50' y='82' font-size='9' font-weight='bold' fill='%23ea580c' text-anchor='middle' font-family='sans-serif' letter-spacing='0.5'>COMBO PACK</text></svg>";

export default function ItemList({ items, itemsLoaded, stallName }) {
  const { user } = useAuth();

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [failedImages, setFailedImages] = useState({});

  /* Load cart */
  const loadLocalCart = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(stored);
  }, []);

  useEffect(() => {
    loadLocalCart();
  }, [loadLocalCart]);

  /* Save Cart */
  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  /* Add Item */
  const handleAddToCart = (item) => {
    if (!user || !user.id) {
      setPopupMessage("⚠️ Please log in to add items.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
      return;
    }

    // ⛔ STALL CONFLICT CHECK
    if (cartItems.length > 0) {
      const existingStall = cartItems[0].stall_id;
      if (existingStall !== item.stall_id) {
        setPopupMessage("⚠ You can add items only from one stall at a time.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
        return;
      }
    }

    const index = cartItems.findIndex((c) => c.id === item.id);
    let updatedCart = [...cartItems];

    if (index > -1) {
      updatedCart[index].quantity += 1;
    } else {
      updatedCart.push({
        id: item.id,
        name: item.name,
        desc: item.description,
        price: item.price,
        is_veg: item.is_veg,
        stall_id: item.stall_id,
        stall_name: stallName || "",
        Gst_precentage: item.Gst_precentage ?? item.gst_percentage ?? 0,
        image_url: item.image_url?.startsWith("http")
          ? item.image_url
          : `${S3_BASE_URL}${item.image_url}`,
        quantity: 1,
      });
    }

    saveCart(updatedCart);

    setPopupMessage("Added to cart!");
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 900);
  };

  const handleDecreaseQuantity = (itemId) => {
    saveCart(
      cartItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const handleIncreaseQuantity = (itemId) => {
    saveCart(
      cartItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  /* ================= FILTER + SEARCH ================= */
  const filteredItems = items
    // ✅ SHOW ONLY AVAILABLE ITEMS
    .filter((item) => item.is_available === true)
    // VEG / NON-VEG FILTER
    .filter((item) => {
      if (filterType === "veg") return item.is_veg;
      if (filterType === "nonveg") return !item.is_veg;
      return true;
    })
    // SEARCH FILTER
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="items-section">
      {/* POPUP */}
      {showPopup && <div className="stall-popup">{popupMessage}</div>}

      {/* SEARCH BAR */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FILTER BUTTONS */}
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

      {/* ITEMS / EMPTY STATE */}
      {itemsLoaded && filteredItems.length === 0 ? (
        <div className="no-items">
          <p>No items available</p>
        </div>
      ) : (
        <div className="item-grid">
          {filteredItems.map((item) => {
            const cartItem = cartItems.find((c) => c.id === item.id);
            const isInCart = !!cartItem;

            const isCombo = !!item.is_combo || (item.name && item.name.includes("🍱"));
            const fallbackImg = isCombo ? COMBO_PLACEHOLDER : FOOD_PLACEHOLDER;
            const hasFailed = failedImages[item.id];
            const isInvalidImg = !item.image_url || item.image_url === "None" || item.image_url === "null";
            const imageUrl = (hasFailed || isInvalidImg)
              ? fallbackImg
              : (item.image_url.startsWith("http") ? item.image_url : `${S3_BASE_URL}${item.image_url}`);

            return (
              <div className="item-card" key={item.id}>
                <div className="item-img-wrapper">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="item-img"
                    onError={() => {
                      setFailedImages((prev) => ({ ...prev, [item.id]: true }));
                    }}
                  />

                  <div
                    className={`food-icon ${
                      item.is_veg ? "veg" : "nonveg"
                    }`}
                  >
                    <div className="dot"></div>
                  </div>
                </div>

                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  {isCombo && item.description && (
                    <p
                      className="item-desc"
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        margin: "2px 0 6px",
                        lineHeight: "1.35",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {item.description}
                    </p>
                  )}

                  <div className="price-add-row">
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span className="price">₹ {item.price}</span>
                        {item.regular_price && item.regular_price > item.price && (
                          <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "11px", fontWeight: "500" }}>
                            ₹{item.regular_price}
                          </span>
                        )}
                      </div>
                      {item.discount_percentage > 0 && (
                        <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "600" }}>
                          {item.discount_percentage}% OFF
                        </span>
                      )}
                    </div>

                    {!isInCart ? (
                      <button
                        className="add-btn-btn"
                        onClick={() => handleAddToCart(item)}
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="qty-box">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleDecreaseQuantity(item.id)
                          }
                        >
                          –
                        </button>
                        <span className="qty-value">
                          {cartItem.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleIncreaseQuantity(item.id)
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
