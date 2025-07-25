import React, { useRef } from 'react';
import './OTP.css';

export default function OtpVerify() {
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value.length === 1 && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="otp-wrapper">
      <div className="otp-header-container">
        <header className="otp-header">Fliplyne</header>
      </div>

      <main className="otp-main">
        <div className="otp-card">
          <h2>Verify OTP</h2>
          <p className="otp-subtext">We’ve sent a 6-digit code to +91 98765 43210</p>

          <label className="otp-label">Enter OTP</label>
          <div className="otp-input-group">
            {inputRefs.map((ref, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                className="otp-input"
                ref={ref}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              />
            ))}
          </div>

          <p className="otp-resend-text">
            Didn’t receive the code? <span className="otp-resend-link">Resend OTP</span>
          </p>

          <button className="otp-button">Send OTP</button>

          <p className="otp-footer">
            Entered wrong number? <span className="otp-change">Change Number</span>
          </p>
        </div>
      </main>
    </div>
  );
}
