import React, { useState, useEffect, useCallback } from "react";
import "../Category/Category.css";
import "./Items.css";
import { useAuth } from "../../AuthContext/ContextApi";

const S3_BASE_URL = "https://fliplyn-assets.s3.ap-south-1.amazonaws.com/";

export default function ItemList({ items, itemsLoaded }) {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [, setIsLoading] = useState(false);

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
  };

  /* Add Item */
  const handleAddToCart = (item) => {
    if (!user || !user.id) {
      setPopupMessage("⚠️ Please log in to add items.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
      return;
    }

    // ⛔ CHECK STALL CONFLICT
    if (cartItems.length > 0) {
      const existingStall = cartItems[0].stall_id;
      if (existingStall !== item.stall_id) {
        setPopupMessage("⚠ You can add items only from one stall at a time.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
        return; // STOP HERE
      }
    }

    setIsLoading(true);

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
        stall_id: item.stall_id, // 👉 store stall id here
        image_url: item.image_url?.startsWith("http")
          ? item.image_url
          : `${S3_BASE_URL}${item.image_url}`,
        quantity: 1,
      });
    }

    saveCart(updatedCart);

    setShowPopup(true);
    setPopupMessage("Added to cart!");

    setTimeout(() => {
      setShowPopup(false);
      setIsLoading(false);
    }, 900);
  };

  const handleDecreaseQuantity = (itemId) => {
    let updatedCart = cartItems
      .map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((i) => i.quantity > 0);

    saveCart(updatedCart);
  };

  const handleIncreaseQuantity = (itemId) => {
    saveCart(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  /* Filter Logic */
  const filteredItems = items.filter((item) => {
    if (filterType === "veg") return item.is_veg;
    if (filterType === "nonveg") return !item.is_veg;
    return true;
  });

  return (
    <div className="items-section">

      {/* POPUP */}
      {showPopup && <div className="stall-popup">{popupMessage}</div>}

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

      {/* Items */}
      <div className="item-grid">
        {filteredItems.map((item) => {
          const cartItem = cartItems.find((c) => c.id === item.id);
          const isInCart = !!cartItem;

          return (
            <div className="item-card" key={item.id}>

              <div className="item-img-wrapper">
                <img
                  src={
                    item.image_url?.startsWith("http")
                      ? item.image_url
                      : `${S3_BASE_URL}${item.image_url}`
                  }
                  alt={item.name}
                  className="item-img"
                />

                <div className={`food-icon ${item.is_veg ? "veg" : "nonveg"}`}>
                  <div className="dot"></div>
                </div>
              </div>

              <div className="item-info">
                <h4 className="item-name">{item.name}</h4>

                <div className="price-add-row">
                  <span className="price">₹ {item.price}</span>

                  {!isInCart ? (
                    <button className="add-btn" onClick={() => handleAddToCart(item)}>
                      + Add
                    </button>
                  ) : (
                    <div className="qty-box">
                      <button onClick={() => handleDecreaseQuantity(item.id)} className="qty-btn">–</button>
                      <span className="qty-value">{cartItem.quantity}</span>
                      <button onClick={() => handleIncreaseQuantity(item.id)} className="qty-btn">+</button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
