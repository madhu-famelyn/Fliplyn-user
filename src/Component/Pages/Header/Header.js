// src/components/Header/Header.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import logo from "../../../assets/Images/Logo.png";
import walletIcon from "../../../assets/Images/image 15.png";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = () => {
    try {
      const items = JSON.parse(localStorage.getItem("cartItems")) || [];
      const total = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
    window.addEventListener("storage", loadCartCount);
    window.addEventListener("cart-updated", loadCartCount);
    return () => {
      window.removeEventListener("storage", loadCartCount);
      window.removeEventListener("cart-updated", loadCartCount);
    };
  }, []);

  return (
    <>
    <nav className="simple-header">
      {/* Left: Logo + Brand */}
      <div
        className="header-left"
        onClick={() => navigate("/stalls")}
      >
        <img src={logo} alt="Fliplyn Logo" className="header-logo" />
        <span className="header-brand">Fliplyn</span>
      </div>

      {/* Right: Wallet + Cart */}
      <div className="header-right">
        <img
          src={walletIcon}
          alt="Wallet"
          className="wallet-icon"
          onClick={() => navigate("/transactions-wallet")}
        />

        <div className="cart-icon-wrapper" onClick={() => navigate("/cart")}>
          <FaShoppingCart className="cart-icon" />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </div>
      </div>
    </nav>
     <div className="announcement-banner">
        <div className="announcement-track">
          <span>
            ✅ Digital payment functionality is now available &nbsp;&nbsp;•&nbsp;&nbsp;
            ⚠️ For item or stall availability queries, only HR representatives are authorized to contact the Support Team. Employees should not reach out to support directly.
          </span>
          <span>
            ✅ Digital payment functionality is now available &nbsp;&nbsp;•&nbsp;&nbsp;
            ⚠️ For item or stall availability queries, only HR representatives are authorized to contact the Support Team. Employees should not reach out to support directly.
          </span>
        </div>
      </div>
      </>
  );
}
