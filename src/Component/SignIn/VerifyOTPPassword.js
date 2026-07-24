import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from './header';
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import './VerifyOTPPassword.css';
import { BASE_URL } from '../apis/apis';

const VerifyOTPPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        email,
        otp: otp.trim(),
      });
      setMessage(response.data.message || 'OTP verified successfully!');
      setTimeout(() => {
        navigate('/change-password', { state: { email, otp: otp.trim() } });
      }, 1000);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to verify OTP. Please try again.');
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
                <ShieldCheck size={15} />
                <span>Email Verification</span>
              </div>
              <h2 className="auth-title">Verify OTP Code</h2>
              <p className="auth-subtitle">
                Enter the OTP sent to <strong>{email || 'your email'}</strong> from <strong>noreply@fliplyn.com</strong>
              </p>
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

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label className="auth-label">Enter 6-Digit OTP Code</label>
                <div className="auth-input-wrapper">
                  <ShieldCheck className="input-icon" size={17} />
                  <input
                    type="text"
                    className="auth-input-field otp-input"
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? (
                  <div className="btn-spinner-box">
                    <span className="btn-spinner"></span>
                    <span>Verifying OTP...</span>
                  </div>
                ) : (
                  <>
                    <span>Verify OTP & Continue</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <span>Didn't receive email from noreply@fliplyn.com?</span>
              <Link to="/forgot-password" className="auth-switch-link">
                Resend OTP
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTPPassword;
