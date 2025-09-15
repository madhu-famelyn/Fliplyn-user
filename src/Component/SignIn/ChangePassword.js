import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ChangePassword.css'; // 👈 Import the matching CSS

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await axios.post('https://admin-aged-field-2794.fly.dev/auth/reset-password', {
        email,
        otp,
        new_password: newPassword
      });
      navigate('/');
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Failed to reset password");
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-header">Fliplyne</div>
      <div className="signin-container">
        <div className="signin-form">
          <h2 className="form-title">Reset Password</h2>

          <label className="email-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />

          <label className="email-label">Confirm Password</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
          />

          {errorMessage && (
            <p className="form-message error">{errorMessage}</p>
          )}

          <button className="form-button" onClick={handleResetPassword}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
