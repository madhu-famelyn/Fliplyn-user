// src/Component/SignIn/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from './header';
import { Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://admin-aged-field-2794.fly.dev/auth/request-otp", {
        email: email.trim(),
      });
      setMessage(response.data.message || 'OTP sent successfully to your email!');
      setTimeout(() => {
        navigate("/verify-otp-password", { state: { email: email.trim() } });
      }, 1200);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to send OTP. Please check your email and try again.");
      }
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
                <span>Password Recovery</span>
              </div>
              <h2 className="auth-title">Forgot Password?</h2>
              <p className="auth-subtitle">
                Enter your registered company email. We will send an OTP code from <strong>noreply@fliplyn.com</strong> to verify your account.
              </p>
            </div>

            <div className="sender-email-info-box">
              <ShieldAlert size={16} />
              <span>Sender Address: <strong>noreply@fliplyn.com</strong></span>
            </div>

            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="auth-success-banner">
                <CheckCircle2 size={18} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="auth-form">
              <div className="form-group">
                <label className="auth-label">Registered Company Email</label>
                <div className="auth-input-wrapper">
                  <Mail className="input-icon" size={17} />
                  <input
                    type="email"
                    className="auth-input-field"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? (
                  <div className="btn-spinner-box">
                    <span className="btn-spinner"></span>
                    <span>Sending OTP from noreply@fliplyn.com...</span>
                  </div>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <span>Remembered your password?</span>
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

export default ForgotPassword;
