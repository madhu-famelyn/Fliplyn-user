// EmailLogin.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { initiateLogin, signupUser } from '../apis/apis';
import { useAuth } from '../AuthContext/ContextApi';
import axios from 'axios';
import Header from './header';
import {
  User,
  Building2,
  Phone,
  Globe,
  MapPin,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import logo from '../../assets/Images/Logo.png';
import './SignIn.css';

export default function EmailLogin({ initialMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Default to 'signin' when opening the app at starting
  const defaultTab = initialMode || (location.pathname === '/signup-page' ? 'signup' : 'signin');
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync activeTab if location changes
  useEffect(() => {
    if (location.pathname === '/signin-page') {
      setActiveTab('signin');
    } else if (location.pathname === '/signup-page') {
      setActiveTab('signup');
    }
  }, [location.pathname]);

  // ================= SIGN IN STATE =================
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ================= SIGN UP STATE =================
  const [selectedCode, setSelectedCode] = useState('+91');
  const [signupLoading, setSignupLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');

  const [form, setForm] = useState({
    name: '',
    company_name: '',
    company_email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    country: '',
    state: '',
    city: '',
    building_id: ''
  });

  const [buildings, setBuildings] = useState([]);

  // const publicDomains = [
  //   'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  //   'rediffmail.com', 'aol.com', 'protonmail.com', 'icloud.com', 'zoho.com'
  // ];

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+81', country: 'Japan' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
  ];

  const states = {
    India: ['Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Karnataka'],
    USA: ['California', 'Texas', 'New York'],
    UK: ['London', 'Manchester'],
    Japan: ['Tokyo', 'Osaka'],
    Australia: ['Sydney', 'Melbourne'],
    UAE: ['Dubai', 'Abu Dhabi']
  };

  const citiesByState = {
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    Telangana: ['Hyderabad', 'Warangal'],
    'Andhra Pradesh': ['Vijayawada', 'Visakhapatnam'],
    Karnataka: ['Bangalore', 'Mysore'],
    California: ['Los Angeles', 'San Francisco'],
    Texas: ['Houston', 'Dallas'],
    'New York': ['New York City'],
    London: ['Central London'],
    Manchester: ['Salford'],
    Tokyo: ['Shibuya'],
    Osaka: ['Kita'],
    Sydney: ['CBD'],
    Melbourne: ['Docklands'],
    Dubai: ['Deira', 'Marina'],
    'Abu Dhabi': ['Yas Island']
  };

  // const isPublicEmail = (email) => {
  //   const parts = email.split('@');
  //   if (parts.length !== 2) return true;
  //   const domain = parts[1].toLowerCase();
  //   return publicDomains.includes(domain);
  // };

  // const isValidCompanyEmail = (email) => {
  //   const domain = email.split('@')[1]?.toLowerCase();
  //   return domain && !publicDomains.includes(domain);
  // };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  // ================= SIGN IN HANDLER =================
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      if (!loginEmail || !loginPassword) {
        throw new Error('Please enter email and password');
      }

      // if (isPublicEmail(loginEmail)) {
      //   throw new Error('Please enter your official company email address');
      // }

      const response = await initiateLogin({
        company_email: loginEmail,
        password: loginPassword
      });

      const token = response.access_token;
      const user = response.user;

      login(token, user);
      navigate('/stalls');
    } catch (err) {
      setLoginError(
        err?.response?.data?.detail ||
        err?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // ================= SIGN UP HANDLERS =================
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSignupError('');
  };

  const fetchBuildingsByCity = async (city) => {
    if (!city) return;
    try {
      const res = await axios.get(
        `https://admin-aged-field-2794.fly.dev/buildings/city/${city}`
      );
      setBuildings(res.data);
    } catch (err) {
      console.error('❌ Failed to load buildings:', err);
      setBuildings([]);
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setForm({ ...form, country, state: '', city: '', building_id: '' });
    setBuildings([]);
    setSignupError('');
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setForm({ ...form, state, city: '', building_id: '' });
    setBuildings([]);
    setSignupError('');
  };

  const handleCityChange = async (e) => {
    const city = e.target.value;
    setForm({ ...form, city, building_id: '' });
    await fetchBuildingsByCity(city);
    setSignupError('');
  };

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    setSignupError('');

    if (!form.name.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }

    if (!form.company_name.trim()) {
      setSignupError('Please enter your company name.');
      return;
    }

    if (!form.phone_number.trim()) {
      setSignupError('Please enter your phone number.');
      return;
    }

    // if (!isValidCompanyEmail(form.company_email)) {
    //   setSignupError('Public email domains (Gmail, Yahoo, etc.) are not allowed. Please use your official work email.');
    //   return;
    // }

    if (!isValidPassword(form.password)) {
      setSignupError('Password must be at least 8 characters long with uppercase, lowercase, number and special character.');
      return;
    }

    if (form.password !== form.confirm_password) {
      setSignupError('Passwords do not match.');
      return;
    }

    if (!form.building_id) {
      setSignupError('Please select your building location.');
      return;
    }

    setSignupLoading(true);
    try {
      const cleanedPhoneNumber = selectedCode.replace('+', '') + form.phone_number;
      const payload = {
        name: form.name,
        company_name: form.company_name,
        company_email: form.company_email,
        phone_number: cleanedPhoneNumber,
        password: form.password,
        building_id: form.building_id
      };

      const signupRes = await signupUser(payload);
      console.log('✅ User created:', signupRes.data);

      setPopupMessage('Account created successfully! Switching to Sign In...');
      setTimeout(() => {
        setPopupMessage('');
        setActiveTab('signin');
        setLoginEmail(form.company_email);
      }, 1800);
    } catch (err) {
      setSignupError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="signin-wrapper">
      <Header />

      {popupMessage && (
        <div className="auth-toast-success">
          <CheckCircle2 size={20} />
          <span>{popupMessage}</span>
        </div>
      )}

      <main className="signin-main">
        <div className={`auth-card-wrapper ${activeTab === 'signup' ? 'wide-card' : ''}`}>

          {/* Segmented Tab Switcher */}
          <div className="auth-segmented-control">
            <button
              type="button"
              className={`auth-segment-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              <UserPlus size={16} />
              <span>Register (New User)</span>
            </button>

            <button
              type="button"
              className={`auth-segment-btn ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          </div>

          <div className="auth-card">

            {/* ================= REGISTER (SIGN UP) TAB ================= */}
            {activeTab === 'signup' && (
              <div className="auth-tab-content fade-in">
                <div className="auth-card-header">
                  <div className="auth-brand-badge">
                    <img src={logo} alt="Fliplyn Logo" className="badge-logo" />
                    <span>Fliplyn Food Portal</span>
                  </div>
                  <h2 className="auth-title">Create Your Account</h2>
                  {/* Original: New user? Register with your work email to order food from your office building stalls. */}
                  <p className="auth-subtitle">
                    New user? Register with your email to order food from your office building stalls.
                  </p>
                </div>

                {signupError && (
                  <div className="auth-error-banner">
                    <AlertCircle size={18} />
                    <span>{signupError}</span>
                  </div>
                )}

                <form onSubmit={handleSignUp} className="auth-form">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="auth-label">Full Name</label>
                      <div className="auth-input-wrapper">
                        <User className="input-icon" size={17} />
                        <input
                          type="text"
                          name="name"
                          className="auth-input-field"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="auth-label">Company Name</label>
                      <div className="auth-input-wrapper">
                        <Building2 className="input-icon" size={17} />
                        <input
                          type="text"
                          name="company_name"
                          className="auth-input-field"
                          placeholder="Acme Corp"
                          value={form.company_name}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="auth-label">Phone Number</label>
                      <div className="phone-field-group">
                        <select
                          className="phone-code-select"
                          value={selectedCode}
                          onChange={(e) => setSelectedCode(e.target.value)}
                        >
                          {countryCodes.map(({ code }) => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                        <div className="auth-input-wrapper flex-1">
                          <Phone className="input-icon" size={17} />
                          <input
                            type="tel"
                            name="phone_number"
                            className="auth-input-field"
                            placeholder="Mobile number"
                            value={form.phone_number}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      {/* <label className="auth-label">Company Email</label> */}
                      {/* <label className="auth-label">Email Address</label> */}
                      <label className="auth-label">Email Id</label>
                      <div className="auth-input-wrapper">
                        <Mail className="input-icon" size={17} />
                        {/* Original placeholder: john@company.com */}
                        <input
                          type="email"
                          name="company_email"
                          className="auth-input-field"
                          placeholder="john@example.com"
                          value={form.company_email}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="auth-label">Country</label>
                      <div className="auth-input-wrapper">
                        <Globe className="input-icon" size={17} />
                        <select
                          name="country"
                          className="auth-input-field select-field"
                          value={form.country}
                          onChange={handleCountryChange}
                          required
                        >
                          <option value="">Country</option>
                          {countryCodes.map(({ country }) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="auth-label">State</label>
                      <div className="auth-input-wrapper">
                        <MapPin className="input-icon" size={17} />
                        <select
                          className="auth-input-field select-field"
                          value={form.state}
                          onChange={handleStateChange}
                          disabled={!form.country}
                          required
                        >
                          <option value="">State</option>
                          {states[form.country]?.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="auth-label">City</label>
                      <div className="auth-input-wrapper">
                        <MapPin className="input-icon" size={17} />
                        <select
                          className="auth-input-field select-field"
                          value={form.city}
                          onChange={handleCityChange}
                          disabled={!form.state}
                          required
                        >
                          <option value="">City</option>
                          {citiesByState[form.state]?.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="auth-label">Building / Workspace Location</label>
                    <div className="auth-input-wrapper">
                      <Building2 className="input-icon" size={17} />
                      <select
                        className="auth-input-field select-field"
                        value={form.building_id}
                        onChange={(e) => {
                          setForm({ ...form, building_id: e.target.value });
                          setSignupError('');
                        }}
                        disabled={!form.city}
                        required
                      >
                        <option value="">
                          {!form.city ? 'Select a City first' : 'Select Building'}
                        </option>
                        {buildings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.building_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="auth-label">Password</label>
                      <div className="auth-input-wrapper">
                        <Lock className="input-icon" size={17} />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          name="password"
                          className="auth-input-field"
                          placeholder="Enter any password"
                          value={form.password}
                          onChange={handleFormChange}
                          required
                        />
                        <button
                          type="button"
                          className="password-eye-btn"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          tabIndex="-1"
                        >
                          {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="auth-label">Confirm Password</label>
                      <div className="auth-input-wrapper">
                        <Lock className="input-icon" size={17} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirm_password"
                          className="auth-input-field"
                          placeholder="Not company password"
                          value={form.confirm_password}
                          onChange={handleFormChange}
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
                  </div>

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={signupLoading}
                  >
                    {signupLoading ? (
                      <div className="btn-spinner-box">
                        <span className="btn-spinner"></span>
                        <span>Registering Account...</span>
                      </div>
                    ) : (
                      <>
                        <span>Register Account</span>
                        <UserPlus size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-card-footer">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => setActiveTab('signin')}
                  >
                    Sign In instead
                  </button>
                </div>
              </div>
            )}

            {/* ================= SIGN IN (LOGIN) TAB ================= */}
            {activeTab === 'signin' && (
              <div className="auth-tab-content fade-in">
                <div className="auth-card-header">
                  <div className="auth-brand-badge">
                    <img src={logo} alt="Fliplyn Logo" className="badge-logo" />
                    <span>Fliplyn Food Portal</span>
                  </div>
                  <h2 className="auth-title">Welcome Back</h2>
                  {/* Original: Sign in with your company email to order from your office cafeteria. */}
                  <p className="auth-subtitle">
                    Sign in with your email to order from your office cafeteria.
                  </p>
                </div>

                {loginError && (
                  <div className="auth-error-banner">
                    <AlertCircle size={18} />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    {/* <label className="auth-label">Company Email</label> */}
                    {/* <label className="auth-label">Email Address</label> */}
                    <label className="auth-label">Email Id</label>
                    <div className="auth-input-wrapper">
                      <Mail className="input-icon" size={17} />
                      {/* Original placeholder: Enter your company email */}
                      <input
                        type="email"
                        className="auth-input-field"
                        placeholder="Enter your email address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="label-with-action">
                      <label className="auth-label">Password</label>
                      <Link to="/forgot-password" className="auth-forgot-link">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="auth-input-wrapper">
                      <Lock className="input-icon" size={17} />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        className="auth-input-field"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-eye-btn"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        tabIndex="-1"
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <div className="btn-spinner-box">
                        <span className="btn-spinner"></span>
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      <>
                        <span>Login</span>
                        <LogIn size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-card-footer">
                  <span>New here?</span>
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => setActiveTab('signup')}
                  >
                    First Register / Sign Up
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
