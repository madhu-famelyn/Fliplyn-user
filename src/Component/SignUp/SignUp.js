import React, { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser, sendOtp, verifyOtp } from '../apis/apis';

export default function SignUp() {
  const [useEmail, setUseEmail] = useState(false);
  const [selectedCode, setSelectedCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    company_name: '',
    company_email: '',
    phone_number: '',
    otp: '',
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

  const cleanedPhoneNumber = selectedCode.replace('+', '') + form.phone_number;

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        phone_number: cleanedPhoneNumber,
        company_email: form.company_email,
      };

      const signupRes = await signupUser(payload);
      console.log('✅ User created:', signupRes.data);

      const otpRes = await sendOtp({
        phone_number: cleanedPhoneNumber,
        company_email: form.company_email,
      });
      console.log('✅ OTP Sent:', otpRes.data);

      setOtpSent(true);
      const target = useEmail ? 'email' : 'mobile';
      setPopupMessage(`OTP sent to your ${target}`);
      setTimeout(() => setPopupMessage(''), 3000); // Hide after 3 seconds
    } catch (err) {
      console.error('❌ Failed during signup or OTP:', err.response?.data?.detail);
      alert(err.response?.data?.detail || 'Signup or OTP failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const verifyRes = await verifyOtp({
        phone_number: cleanedPhoneNumber,
        company_email: form.company_email,
        otp: form.otp,
      });

      console.log('✅ OTP Verified:', verifyRes.data);
      navigate('/');
    } catch (err) {
      console.error('❌ OTP Verification Failed:', err.response?.data?.detail);
      alert(err.response?.data?.detail || 'OTP verification failed');
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
          <p className="signup-subtext">
            Enter your {useEmail ? 'email' : 'phone'} to get started.
          </p>

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

          {useEmail ? (
            <>
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
                placeholder="Enter email"
                onChange={handleChange}
                value={form.company_email}
              />
            </>
          ) : (
            <>
              <label className="signup-label">Company Email</label>
              <input
                className="signup-input"
                name="company_email"
                type="email"
                placeholder="Enter email"
                onChange={handleChange}
                value={form.company_email}
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
            </>
          )}

          <button className="signup-send-otp" onClick={handleSendOtp} disabled={loading}>
            Send OTP
          </button>

          <label className="signup-label">Enter OTP</label>
          <input
            name="otp"
            className="signup-input"
            placeholder="Enter 6-digit OTP"
            onChange={handleChange}
            value={form.otp}
            disabled={!otpSent}
          />
                  <button
          className="signup-button"
          onClick={handleVerifyOtp}
          disabled={!otpSent || !form.otp || loading}
        >
          Create Account
        </button>

          <p className="signup-switch" onClick={() => setUseEmail(!useEmail)}>
            Use {useEmail ? 'Phone Number' : 'Email'} Instead
          </p>

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
