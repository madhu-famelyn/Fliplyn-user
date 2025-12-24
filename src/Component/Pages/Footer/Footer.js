import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Footer.css";

import HomeIcon from "../../../assets/Images/Home.png";
// import CartIcon from "../../../assets/Images/Cart.png";
import DocIcon from "../../../assets/Images/Transactions.png";
import ProfileIcon from "../../../assets/Images/profile.png";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="footer-container">
      <div
        className={`footer-item ${isActive("/stalls") ? "active" : ""}`}
        onClick={() => navigate("/stalls")}
      >
        <img src={HomeIcon} alt="Home" />
        <span>Home</span>
      </div>

      {/* <div
        className={`footer-item ${isActive("/shops") ? "active" : ""}`}
        onClick={() => navigate("/shops")}
      >
        <img src={CartIcon} alt="Cart" />
        <span>Shop</span>
      </div> */}

      <div
        className={`footer-item ${isActive("/trans") ? "active" : ""}`}
        onClick={() => navigate("/trans")}
      >
        <img src={DocIcon} alt="Transactions" />
        <span>Transactions</span>
      </div>

      <div
        className={`footer-item ${isActive("/profile") ? "active" : ""}`}
        onClick={() => navigate("/profile")}
      >
        <img src={ProfileIcon} alt="Profile" />
        <span>Profile</span>
      </div>
    </div>
  );
};

export default Footer;
