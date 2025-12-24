import React, { useEffect, useState } from 'react';
import './Profile.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useAuth } from '../../AuthContext/ContextApi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [fullUser, setFullUser] = useState(null);
  const [noUserFound, setNoUserFound] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    company_name: '',
    company_email: '',
  });

  useEffect(() => {
    if (user?.id) {
      axios.get(`https://admin-aged-field-2794.fly.dev/user/${user.id}`)
        .then(res => {
          if (!res.data || Object.keys(res.data).length === 0) {
            setNoUserFound(true);
            return;
          }

          setFullUser(res.data);
          setFormData({
            name: res.data.name || '',
            phone_number: res.data.phone_number || '',
            company_name: res.data.company_name || '',
            company_email: res.data.company_email || ''
          });

          // ✅ Save data to localStorage
          localStorage.setItem("user_id", res.data.id);
          localStorage.setItem("user_phone", res.data.phone_number);
          localStorage.setItem("user_email", res.data.company_email);

        })
        .catch(err => {
          console.error("Error fetching user details:", err);
          setNoUserFound(true);
        });
    } else {
      setNoUserFound(true);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateSubmit = () => {
    axios.put(`https://admin-aged-field-2794.fly.dev/user/${user.id}`, formData)
      .then(res => {
        setFullUser(res.data);
        setShowEditModal(false);

        // 🔁 Update localStorage on edit also
        localStorage.setItem("user_phone", res.data.phone_number);
        localStorage.setItem("user_email", res.data.company_email);

      })
      .catch(err => {
        console.error("Error updating user:", err);
        alert("Update failed. Try again.");
      });
  };

  const handleLogout = () => {
    // ❌ Remove data from localStorage when logging out
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_email");

    logout();
    navigate('/');
  };

  if (noUserFound) {
    return (
      <div className="profile-container" style={{ textAlign: 'center', padding: '20px' }}>
        <p>No user found</p>
        <button onClick={() => navigate('/')}>Login</button>
      </div>
    );
  }

  if (!fullUser) {
    return <p className="profile-loading">Loading...</p>;
  }

  return (
    <>
      <Header />
      <div className="profile-container">
        <h2 className="profile-title">Profile</h2>
        <hr className="profile-divider" />
        <div className="profile-info">
          <div className="profile-row">
            <span className="label">Name</span>
            <span className="value">{fullUser.name || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="label">Phone Number</span>
            <span className="value">{fullUser.phone_number || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="label">Company Name</span>
            <span className="value">{fullUser.company_name || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="label">Company Email</span>
            <span className="value">{fullUser.company_email || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="label">Created At</span>
            <span className="value">{new Date(fullUser.created_datetime).toLocaleString()}</span>
          </div>
        </div>

        <div className="profile-buttons">
          <button className="edit-btn" onClick={() => setShowEditModal(true)}>Edit Profile</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profile</h3>

            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />

            <label>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
            />

            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
            />

            <label>Company Email</label>
            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleInputChange}
            />

            <div className="modal-buttons">
              <button onClick={handleUpdateSubmit}>Save</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </>
  );
}
