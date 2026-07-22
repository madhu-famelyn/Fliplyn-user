// src/Component/SignIn/ChangePassword.js
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import './ChangePassword.css';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://admin-aged-field-2794.fly.dev/auth/reset-password', {
        email,
        otp,
        new_password: newPassword
      });
      setSuccessMessage(response.data?.message || 'Password reset successful! Redirecting to Sign In...');
      setTimeout(() => {
        navigate('/signin-page');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-wrapper">
      <Header />
      <main className="signin-main">
        <div className="forgot-card-wrapper">
          <div className="auth-card">

            <div className="auth-card-header">
              <div className="auth-brand-badge">
                <KeyRound size={15} />
                <span>New Password</span>
              </div>
              <h2 className="auth-title">Set New Password</h2>
              <p className="auth-subtitle">
                Create your new password for account <strong>{email || ''}</strong>
              </p>
            </div>

            {errorMessage && (
              <div className="auth-error-banner">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-success-banner">
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="input-icon" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="auth-label">Confirm New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="input-icon" size={17} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? (
                  <div className="btn-spinner-box">
                    <span className="btn-spinner"></span>
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <KeyRound size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <Link to="/signin-page" className="auth-switch-link">
                Back to Sign In
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
