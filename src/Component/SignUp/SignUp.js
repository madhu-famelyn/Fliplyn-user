import React, { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../apis/apis';

export default function SignUp() {
  const [selectedCode, setSelectedCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    company_name: '',
    company_email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+81', country: 'Japan' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidCompanyEmail = (email) => {
    const publicDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'protonmail.com', 'icloud.com', 'zoho.com', 'gmx.com', 'mail.com', 'yandex.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !publicDomains.includes(domain);
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const cleanedPhoneNumber = selectedCode.replace('+', '') + form.phone_number;

  const handleSignUp = async () => {
    if (!isValidCompanyEmail(form.company_email)) {
      alert('Public email domains are not allowed. Please use your company email.');
      return;
    }

    if (!isValidPassword(form.password)) {
      alert('Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.');
      return;
    }

    if (form.password !== form.confirm_password) {
      alert('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        company_name: form.company_name,
        company_email: form.company_email,
        phone_number: cleanedPhoneNumber,
        password: form.password,
      };

      const signupRes = await signupUser(payload);

      setPopupMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        setPopupMessage('');
        navigate('/'); // navigate to sign in
      }, 2000);
    } catch (err) {
      console.error('❌ Signup failed:', err.response?.data?.detail);
      alert(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {popupMessage && (
        <div className="popup-message">
          {popupMessage}
        </div>
      )}

      <div className="signup-header-container">
        <header className="signup-header">Fliplyne</header>
      </div>

      <main className="signup-main">
        <div className="signup-card">
          <h2>Create Your Account</h2>
          <p className="signup-subtext">Enter your company email to get started.</p>

          <label className="signup-label">Name</label>
          <input
            className="signup-input"
            name="name"
            type="text"
            onChange={handleChange}
            value={form.name}
          />

          <label className="signup-label">Company Name</label>
          <input
            className="signup-input"
            name="company_name"
            type="text"
            onChange={handleChange}
            value={form.company_name}
          />

          <label className="signup-label">Phone Number</label>
          <div className="signup-phone-input">
            <select
              className="signup-code"
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              {countryCodes.map(({ code }) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              name="phone_number"
              type="text"
              className="signup-number"
              placeholder="Enter number"
              onChange={handleChange}
              value={form.phone_number}
            />
          </div>

          <label className="signup-label">Company Email</label>
          <input
            className="signup-input"
            name="company_email"
            type="email"
            placeholder="Enter company email"
            onChange={handleChange}
            value={form.company_email}
          />

          <label className="signup-label">Password</label>
          <input
            className="signup-input"
            name="password"
            type="password"
            placeholder="Enter strong password"
            onChange={handleChange}
            value={form.password}
          />

          <label className="signup-label">Confirm Password</label>
          <input
            className="signup-input"
            name="confirm_password"
            type="password"
            placeholder="Re-enter password"
            onChange={handleChange}
            value={form.confirm_password}
          />

          <button
            className="signup-button"
            onClick={handleSignUp}
            disabled={loading}
          >
            Sign Up
          </button>

          <p className="signup-footer">
            Already have an account?{' '}
            <Link to="/" className="signup-link">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
