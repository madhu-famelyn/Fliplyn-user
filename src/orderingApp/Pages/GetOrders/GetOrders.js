import React, { useState } from "react";
import "./GetOrders.css";
import { useNavigate } from "react-router-dom";

const GetOrders = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSendOtp = () => {
    if (!email) {
      alert("Please enter email");
      return;
    }

    console.log("Send OTP to:", email);

    // 👉 Call your API here
  };

  return (
    <div className="getorders-container">

      {/* Header */}
      <div className="header">
        <span className="back" onClick={() => navigate(-1)}>
          ← Back
        </span>
      </div>

      {/* Content */}
      <div className="content">

        <h1 className="title">Get Your Orders</h1>
        <p className="subtitle">Enter your email to receive an OTP</p>

        {/* Email Input */}
        <div className="input-group">
          <label>Email</label>

          <div className="input-box">
            <span className="icon">✉️</span>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Button */}
        <button className="otp-btn" onClick={handleSendOtp}>
          Send OTP
        </button>

      </div>
    </div>
  );
};

export default GetOrders;