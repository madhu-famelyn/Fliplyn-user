import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext/ContextApi";
import { 
  FaPaperPlane, 
  FaTimes, 
  FaCheckCircle, 
  FaRegCommentDots, 
  FaSpinner
} from "react-icons/fa";

import "./FeedbackModal.css";

const FEEDBACK_CATEGORIES = [
  "General Feedback",
  "Food Quality",
  "App Experience",
  "Wallet & Payments",
  "Stall Service",
  "New Feature Suggestion",
  "Complaint / Issue",
];

const API_BASE = process.env.REACT_APP_API_URL || "https://admin-aged-field-2794.fly.dev";

export default function FeedbackModal({ isOpen, onClose }) {
  const { user } = useAuth();

  const [category, setCategory] = useState("General Feedback");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const customerName = user?.name || user?.first_name || user?.username || "Valued Customer";
  const customerEmail = user?.email || user?.user_email || "customer@fliplyn.com";
  const customerPhone = user?.phone || user?.phone_number || user?.mobile || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please write your feedback before sending.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE}/feedback/`, {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        feedback_type: category,
        message: message.trim(),
        building_name: user?.building_name || localStorage.getItem("selectedBuildingName") || null,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Unable to submit feedback at the moment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setMessage("");
    setCategory("General Feedback");
    setIsSuccess(false);
    setError("");
    onClose();
  };

  return (
    <div className="fb-overlay" onClick={handleResetAndClose}>
      <div className="fb-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="fb-header">
          <div className="fb-header-title-wrap">
            <div className="fb-header-icon-box">
              <FaRegCommentDots />
            </div>
            <div>
              <h3>Share Your Feedback</h3>
              <p>We read every message to improve your experience</p>
            </div>
          </div>
          <button className="fb-close-btn" onClick={handleResetAndClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="fb-success-container">
            <div className="fb-success-icon-wrap">
              <FaCheckCircle />
            </div>
            <h4>Thank You For Your Feedback!</h4>
            <p>
              Your message has been sent directly to our management team. We appreciate your valuable inputs!
            </p>
            <button className="fb-done-btn" onClick={handleResetAndClose}>
              Done
            </button>
          </div>
        ) : (
          /* Form View */
          <form className="fb-form" onSubmit={handleSubmit}>
            {/* Category selection */}
            <div className="fb-field-group">
              <label className="fb-label">Feedback Category</label>
              <div className="fb-category-chips">
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`fb-chip ${category === cat ? "is-selected" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}

            <div className="fb-field-group">
              <label className="fb-label">Your Comments / Suggestions</label>
              <textarea
                className="fb-textarea"
                rows="4"
                placeholder="Tell us what you loved, any food issues, or how we can make Fliplyn better for you..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (error) setError("");
                }}
                maxLength={1000}
                required
              />
              <div className="fb-char-count">{message.length}/1000 characters</div>
            </div>

            {/* Error banner */}
            {error && <div className="fb-error-banner">{error}</div>}

            {/* Submit Button */}
            <div className="fb-actions">

              <button
                type="button"
                className="fb-cancel-btn"
                onClick={handleResetAndClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="fb-submit-btn"
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <>
                    <FaSpinner className="fb-spinner" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
