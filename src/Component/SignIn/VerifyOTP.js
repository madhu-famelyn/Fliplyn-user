import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOTP.css';
import { verifyLoginOTP, initiateLoginOTP } from '../apis/apis'; // Ensure initiateLoginOTP is implemented
import { useAuth } from '../AuthContext/ContextApi';


export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const { login } = useAuth(); // ⬅️ Add this line at the top inside component

  const location = useLocation();
  const navigate = useNavigate();

  const phoneNumber = location.state?.phone_number;
  const email = location.state?.email;

  // ⏲️ Timer logic
  useEffect(() => {
    let countdown;
    if (resendDisabled && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(countdown);
      setResendDisabled(false);
    }

    return () => clearInterval(countdown);
  }, [timer, resendDisabled]);

  // 🧠 Handle OTP input change
  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

const handleVerify = async () => {
  const otpCode = otp.join('');
  if (otpCode.length < 6) {
    setError('Please enter a 6-digit OTP.');
    return;
  }

  setLoading(true);
  setError('');
  try {
    const payload = {
      otp: otpCode,
      phone_number: phoneNumber || undefined,
      company_email: email || undefined,
    };
    const result = await verifyLoginOTP(payload);

    login(result.token, result.user); // ✅ this is what you were missing

    navigate('/select-country');
  } catch (err) {
    console.error('Verification failed:', err);
    setError(err?.detail || 'OTP verification failed.');
  } finally {
    setLoading(false);
  }
};


  // 🔁 Resend OTP handler (calls /user/login/initiate)
  const handleResend = async () => {
    if (resendDisabled) return;

    try {
      const payload = {
        phone_number: phoneNumber || undefined,
        company_email: email || undefined,
      };
      await initiateLoginOTP(payload);
      setTimer(60);
      setResendDisabled(true);
    } catch (err) {
      console.error('Failed to resend OTP:', err);
    }
  };

  const handleChangeInfo = () => {
    navigate('/');
  };

  return (
    <div>
      <div className="signin-header-container">
        <header className="signin-header">Fliplyne</header>
      </div>

      <div className="verify-wrapper">
        <div className="verify-card">
          <h2 className="verify-title">Verify OTP</h2>
          <p className="verify-subtext">
            {phoneNumber && <>We’ve sent a 6-digit code to +{phoneNumber}</>}
            {email && <>We’ve sent a 6-digit code to {email}</>}
          </p>

          <div className="otp-section">
            <label className="verify-label">Enter OTP</label>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  className="otp-box"
                />
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}

            <p className="resend-text">
              Didn’t receive the code?{' '}
              <span
                className={`resend-link ${resendDisabled ? 'disabled' : ''}`}
                onClick={handleResend}
                style={{
                  cursor: resendDisabled ? 'not-allowed' : 'pointer',
                  color: resendDisabled ? '#999' : '#e97836ff'
                }}
              >
                {resendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
              </span>
            </p>
          </div>

          <button
            className="verify-button"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <p className="change-number">
            Entered wrong {phoneNumber ? 'number' : 'email'}?{' '}
            <span className="change-link" onClick={handleChangeInfo}>
              Change {phoneNumber ? 'Number' : 'Email'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
