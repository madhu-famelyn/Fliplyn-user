import React, { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../apis/apis';
import axios from 'axios';

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
    country: 'India',
    state: '',
    city: '',
    building_id: ''
  });

  const [buildings, setBuildings] = useState([]);

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+81', country: 'Japan' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
  ];

  const states = [
    'Tamil Nadu',
    'Telangana',
    'Andhra Pradesh',
    'Karnataka'
  ];

  const citiesByState = {
    Telangana: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'],
    'Andhra Pradesh': ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati', 'Nellore'],
    Karnataka: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum']
  };

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

  // ✅ Fetch buildings by city
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

  const handleStateChange = (e) => {
    const state = e.target.value;
    setForm({ ...form, state, city: '', building_id: '' });
    setBuildings([]);
  };

  const handleCityChange = async (e) => {
    const city = e.target.value;
    setForm({ ...form, city, building_id: '' });
    await fetchBuildingsByCity(city);
  };

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

    if (!form.building_id) {
      alert('Please select a building.');
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
        building_id: form.building_id
      };

      const signupRes = await signupUser(payload);
      console.log('✅ User created:', signupRes.data);

      setPopupMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        setPopupMessage('');
        navigate('/');
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

      {popupMessage && <div className="popup-message">{popupMessage}</div>}

      <div className="signup-header-container">
        <header className="signup-header">Fliplyne</header>
      </div>

      <main className="signup-main">
        <div className="signup-card">
          <h2>Create Your Account</h2>
          <p className="signup-subtext">Enter your company email to get started.</p>

          <label className="signup-label">Name</label>
          <input className="signup-input" name="name" type="text" onChange={handleChange} value={form.name} />

          <label className="signup-label">Company Name</label>
          <input className="signup-input" name="company_name" type="text" onChange={handleChange} value={form.company_name} />

          <label className="signup-label">Phone Number</label>
          <div className="signup-phone-input">
            <select className="signup-code" value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}>
              {countryCodes.map(({ code }) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            <input name="phone_number" type="text" className="signup-number" placeholder="Enter number" onChange={handleChange} value={form.phone_number} />
          </div>

          {/* ✅ Country */}
          <label className="signup-label">Country</label>
          <select className="signup-input" name="country" value={form.country} disabled>
            <option>India</option>
          </select>

          {/* ✅ State */}
          <label className="signup-label">State</label>
          <select className="signup-input" value={form.state} onChange={handleStateChange}>
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* ✅ City */}
          <label className="signup-label">City</label>
          <select
            className="signup-input"
            value={form.city}
            onChange={handleCityChange}
            disabled={!form.state}
          >
            <option value="">Select City</option>
            {form.state &&
              citiesByState[form.state]?.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
          </select>

          {/* ✅ Building Dropdown */}
          <label className="signup-label">Building</label>
          <select
            className="signup-input"
            value={form.building_id}
            onChange={(e) => setForm({ ...form, building_id: e.target.value })}
            disabled={!form.city}
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.building_name}
              </option>
            ))}
          </select>

          <label className="signup-label">Company Email</label>
          <input className="signup-input" name="company_email" type="email" placeholder="Enter company email" onChange={handleChange} value={form.company_email} />

          <label className="signup-label">Password</label>
          <input className="signup-input" name="password" type="password" placeholder="Enter strong password" onChange={handleChange} value={form.password} />

          <label className="signup-label">Confirm Password</label>
          <input className="signup-input" name="confirm_password" type="password" placeholder="Re-enter password" onChange={handleChange} value={form.confirm_password} />

          <button className="signup-button" onClick={handleSignUp} disabled={loading}>
            Sign Up
          </button>

          <p className="signup-footer">
            Already have an account?{' '}
            <Link to="/" className="signup-link">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
