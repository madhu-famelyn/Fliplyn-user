import React, { useEffect, useState } from 'react';
import './Profile.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useAuth } from '../../AuthContext/ContextApi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import profileIcon from '../../../assets/Images/Profile/profile.png';
import personalIcon from '../../../assets/Images/Profile/Profile Icon (1).png';
import orgIcon from '../../../assets/Images/Profile/organization.png';
import memberIcon from '../../../assets/Images/Profile/member since.png';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [fullUser, setFullUser] = useState(null);
  const [noUserFound, setNoUserFound] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setNoUserFound(true);
      return;
    }

    axios.get(`https://admin-aged-field-2794.fly.dev/user/${user.id}`)
      .then(res => {
        if (!res.data) {
          setNoUserFound(true);
          return;
        }
        setFullUser(res.data);
      })
      .catch(() => setNoUserFound(true));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (noUserFound) {
    return <p style={{ textAlign: 'center' }}>No user found</p>;
  }

  if (!fullUser) {
    return <p style={{ textAlign: 'center' }}>Loading...</p>;
  }

  return (
    <>
      <Header />

      <div className="profile-page">
        {/* HEADER */}
        <div className="profile-header">
          <img src={profileIcon} alt="Profile" className="profile-avatar" />
          <h2>{fullUser.name}</h2>
          <p>Profile</p>
        </div>

        {/* CARD : PERSONAL INFO */}
        <div className="profile-card">
          <div className="card-left">
            <img src={personalIcon} alt="Personal" />
          </div>
          <div className="card-center">
            <h4>Personal Info</h4>
            <p>Name</p>
            <strong>{fullUser.name}</strong>
            <span>{fullUser.phone_number}</span>
          </div>
          <div className="card-right">›</div>
        </div>

        {/* CARD : ORGANIZATION */}
        <div className="profile-card">
          <div className="card-left">
            <img src={orgIcon} alt="Organization" />
          </div>
          <div className="card-center">
            <h4>Organization</h4>
            <p>Name</p>
            <strong>{fullUser.company_name}</strong>
            <span>{fullUser.company_email}</span>
          </div>
          <div className="card-right">›</div>
        </div>

        {/* CARD : MEMBER SINCE */}
        <div className="profile-card">
          <div className="card-left">
            <img src={memberIcon} alt="Member" />
          </div>
          <div className="card-center">
            <h4>Member Since</h4>
            <strong>
              {new Date(fullUser.created_datetime).toLocaleString()}
            </strong>
          </div>
          <div className="card-right">›</div>
        </div>

        {/* BUTTONS */}
        <button className="logout-profile-btn" onClick={handleLogout}>
          ⎋ Logout
        </button>
      </div>

      <Footer />
    </>
  );
}
