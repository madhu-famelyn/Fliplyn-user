// src/components/VerifyOTPPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOTPPassword.css'

const VerifyOTPPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/verify-otp', {
        email,
        otp,
      });
      setMessage(response.data.message);
      navigate('/change-password', { state: { email, otp } });  
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to verify OTP');
      }
    }
  };

  return (
    <div className="signin-page">
      <header className="signin-header">Fliplyne</header>
      <div className="signin-container">
        <form className="signin-form" onSubmit={handleVerifyOtp}>
          <h2 className="form-title">Verify OTP</h2>
          <p className="email-label">Email: <strong>{email}</strong></p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="form-input"
          />
          <button type="submit" className="form-button">Verify</button>
          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPassword;
