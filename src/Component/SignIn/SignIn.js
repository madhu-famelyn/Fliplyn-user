// EmailLogin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { initiateLogin } from '../apis/apis';
import { useAuth } from '../AuthContext/ContextApi';
import './SignIn.css';

export default function EmailLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const publicDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'rediffmail.com', 'aol.com', 'protonmail.com', 'icloud.com', 'zoho.com'
  ];

  const isPublicEmail = (email) => {
    const parts = email.split('@');
    if (parts.length !== 2) return true;
    const domain = parts[1].toLowerCase();
    return publicDomains.includes(domain);
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter email and password');
      }

      if (isPublicEmail(email)) {
        alert('Please enter your office email ID');
        setLoading(false);
        return;
      }

      // API Call
      const response = await initiateLogin({
        company_email: email,
        password
      });

      const token = response.access_token;
      const user = response.user; // contains email & phone

      // Save token + user in context
      login(token, user);

      // Redirect
      navigate('/stalls');

    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-header-container">
        <header className="signin-header">Fliplyn</header>
      </div>

      <main className="signin-main">
        <div className="signin-card">
          <h2 className="signin-title">Welcome Back</h2>
          <p className="signin-subtext">
            Sign in with your company email to continue.
          </p>

          {error && <p className="signin-error">{error}</p>}

          <label className="signin-label">Company Email</label>
          <input
            type="email"
            className="signin-email"
            placeholder="Enter your company email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="signin-label">Password</label>
          <input
            type="password"
            className="signin-email"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="signin-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="signin-footer">
            <span className="left">
              New here?{' '}
              <Link to="/signup-page" className="signup-link">
                Sign Up
              </Link>
            </span>
            <span className="right">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password
              </Link>
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
