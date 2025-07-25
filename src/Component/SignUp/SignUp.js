import React, { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser, sendOtp, verifyOtp } from '../apis/apis';

export default function SignUp() {
  const [useEmail, setUseEmail] = useState(false);
  const [selectedCode, setSelectedCode] = useState('+91');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    company_name: '',
    company_email: '',
    phone_number: '',
    otp: '',
  });

  const [step, setStep] = useState(1); // 1 = input, 2 = otp

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

  // Normalize the phone number before sending to backend
  const cleanedPhoneNumber = selectedCode.replace('+', '') + form.phone_number;

  const handleSignup = async () => {
    const payload = {
      ...form,
      phone_number: cleanedPhoneNumber,
    };

    try {
      const res = await signupUser(payload);
      console.log('✅ Signup Success:', res.data);
      setStep(2); // Go to OTP verification
    } catch (err) {
      console.error('❌ Signup Failed:', err.response?.data?.detail);
      alert(err.response?.data?.detail || 'Signup failed');
    }
  };

  const handleSendOtp = async () => {
    try {
      const res = await sendOtp({
        phone_number: cleanedPhoneNumber,
        company_email: form.company_email,
      });
      console.log('✅ OTP Sent:', res.data);
      alert('OTP sent');
    } catch (err) {
      console.error('❌ OTP Failed:', err.response?.data?.detail);
      alert(err.response?.data?.detail || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await verifyOtp({
        phone_number: cleanedPhoneNumber,
        company_email: form.company_email,
        otp: form.otp,
      });
      console.log('✅ OTP Verified:', res.data);
      alert('Account created successfully!');
      navigate('/signin');
    } catch (err) {
      console.error('❌ OTP Invalid:', err.response?.data?.detail);
      alert(err.response?.data?.detail || 'OTP verification failed');
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-header-container">
        <header className="signup-header">Fliplyne</header>
      </div>

      <main className="signup-main">
        <div className="signup-card">
          <h2>Create Your Account</h2>
          <p className="signup-subtext">Enter your {useEmail ? 'email' : 'phone'} to get started.</p>

          {step === 1 ? (
            <>
              <label className="signup-label">Name</label>
              <input className="signup-input" name="name" type="text" onChange={handleChange} />

              <label className="signup-label">Company name</label>
              <input className="signup-input" name="company_name" type="text" onChange={handleChange} />

              <label className="signup-label">Company Email</label>
              <input className="signup-input" name="company_email" type="email" onChange={handleChange} />

              {!useEmail ? (
                <>
                  <label className="signup-label">Phone number</label>
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
                    />
                  </div>
                </>
              ) : (
                <>
                  <label className="signup-label">Email</label>
                  <input
                    name="company_email"
                    type="email"
                    className="signup-input"
                    placeholder="Enter email"
                    onChange={handleChange}
                  />
                </>
              )}

              <button className="signup-send-otp" onClick={handleSendOtp}>
                Send OTP
              </button>

              <p className="signup-switch" onClick={() => setUseEmail(!useEmail)}>
                Use {useEmail ? 'Phone Number' : 'Email'} Instead
              </p>

              <button className="signup-button" onClick={handleSignup}>
                Create Account
              </button>
            </>
          ) : (
            <>
              <label className="signup-label">OTP Code</label>
              <input
                name="otp"
                className="signup-input"
                placeholder="Enter 6-digit OTP"
                onChange={handleChange}
              />

              <button className="signup-button" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </>
          )}

          <p className="signup-footer">
            Already have an account? <Link to="/signin" className="signup-link">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
