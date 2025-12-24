// src/components/Header/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import logo from "../../../assets/Images/Logo.png";
import walletIcon from "../../../assets/Images/image 15.png";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

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

        <FaShoppingCart
          className="cart-icon"
          onClick={() => navigate("/cart")}
        />
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
