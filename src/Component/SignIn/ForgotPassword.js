// src/components/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/request-otp", {
        email: email,
      });
      setMessage(response.data.message);
      navigate("/verify-otp-password", { state: { email } });
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="signin-wrapper">
      <header className="signin-header">Fliplyne</header>
      <main className="signin-main">
        <div className="signin-card">
          <h2 className="signin-title">Forgot Password</h2>
          <p className="signin-subtext">Enter your registered email to receive OTP</p>
          <form onSubmit={handleRequestOtp}>
            <label className="signin-label">Email</label>
            <input
              type="email"
              className="signin-email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="signin-button">Send OTP</button>
          </form>
          {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
