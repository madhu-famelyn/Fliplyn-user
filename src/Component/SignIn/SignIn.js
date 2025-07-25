import React, { useState } from 'react';
import './SignIn.css';
import { Link, useNavigate } from 'react-router-dom';
import { initiateLogin, verifyLoginOTP } from '../apis/apis';
import { useAuth } from '../AuthContext/ContextApi';

export default function SignIn() {
  const [useEmail, setUseEmail] = useState(false);
  const [selectedCode, setSelectedCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { login } = useAuth(); // ✅ Auth context hook

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+81', country: 'Japan' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
  ];

  const handleSendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      if (useEmail) {
        if (!email) throw new Error('Please enter your email');
        await initiateLogin({ company_email: email });
      } else {
        if (!phoneNumber) throw new Error('Please enter your phone number');
        await initiateLogin({ phone_number: phoneNumber });
      }
      setOtpSent(true);
    } catch (err) {
      setError(err.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await verifyLoginOTP({
        phone_number: !useEmail ? phoneNumber : undefined,
        company_email: useEmail ? email : undefined,
        otp,
      });

      // ✅ Store auth data in context
      login(response.access_token, response.user);

      // ✅ Navigate to next page
      navigate('/select-country');
    } catch (err) {
      setError(err.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-header-container">
        <header className="signin-header">Fliplyne</header>
      </div>

      <main className="signin-main">
        <div className="signin-card">
          <h2>Welcome Back</h2>
          <p className="signin-subtext">
            Sign in to continue ordering from your favorite spots.
          </p>

          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

          {!otpSent ? (
            <>
              {!useEmail ? (
                <>
                  <label className="signin-label">Phone Number</label>
                  <div className="signin-phone-input">
                    <select
                      className="signin-code"
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
                      type="text"
                      className="signin-number"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <p className="signin-switch" onClick={() => setUseEmail(true)}>
                    Use Email Instead
                  </p>
                </>
              ) : (
                <>
                  <label className="signin-label">Email</label>
                  <input
                    type="email"
                    className="signin-email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="signin-switch" onClick={() => setUseEmail(false)}>
                    Use Phone Number Instead
                  </p>
                </>
              )}

              <button className="signin-button" onClick={handleSendOTP} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <label className="signin-label">OTP Code</label>
              <input
                type="text"
                className="signin-email"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="signin-button" onClick={handleVerifyOTP} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}

          <p className="signin-footer">
            New here? <Link to="/signup" className="signup-link">Sign Up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
