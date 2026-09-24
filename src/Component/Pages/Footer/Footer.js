import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaRegCommentDots } from "react-icons/fa";
import "./Footer.css";

import HomeIcon from "../../../assets/Images/Home.png";
import DocIcon from "../../../assets/Images/Transactions.png";
import ProfileIcon from "../../../assets/Images/profile.png";
import FeedbackModal from "../Feedback/FeedbackModal";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="footer-container">
        {/* Home */}
        <div
          className={`footer-item ${isActive("/stalls") ? "active" : ""}`}
          onClick={() => navigate("/stalls")}
        >
          <img src={HomeIcon} alt="Home" />
          <span>Home</span>
        </div>

        {/* Transactions */}
        <div
          className={`footer-item ${isActive("/trans") ? "active" : ""}`}
          onClick={() => navigate("/trans")}
        >
          <img src={DocIcon} alt="Transactions" />
          <span>Transactions</span>
        </div>

        {/* Feedback (User Request) */}
        <div
          className={`footer-item ${isFeedbackOpen || isActive("/feedback") ? "active" : ""}`}
          onClick={() => setIsFeedbackOpen(true)}
          title="Share Feedback"
        >
          <FaRegCommentDots className="footer-icon-svg" />
          <span>Feedback</span>
        </div>

        {/* Profile */}
        <div
          className={`footer-item ${isActive("/profile") ? "active" : ""}`}
          onClick={() => navigate("/profile")}
        >
          <img src={ProfileIcon} alt="Profile" />
          <span>Profile</span>
        </div>
      </div>

      {/* Interactive Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
};

export default Footer;
