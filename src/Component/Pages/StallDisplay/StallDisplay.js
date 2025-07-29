// src/components/StallDisplay.js
import React from 'react';
import './StallDisplay.css';
import '../../fonts.css';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';

export default function StallDisplay({ name = '', description = '', imageUrl = '', categoryCount = 0, itemCount = 0 }) {
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ Back Button */}
      <div className="back-button-container">
<button className="back-button" onClick={() => navigate(-1)}>
  <IoIosArrowBack style={{ marginRight: '8px' }} />
  {name}
</button>
      </div>

      {/* ✅ Stall Banner */}
      <div
        className="stall-banner"
        style={{ backgroundImage: `url(https://fliplyn.onrender.com/${imageUrl})` }}
      >
        <div className="stall-banner-overlay">
          <div className="stall-info-left">
            <h1 className="stall-title">{name}</h1>
            <p className="stall-subtitle">{description}</p>
          </div>
          <div className="stall-info-right">
            <div className="stall-count-group">
              <p className="stall-count">{itemCount}</p>
              <p className="stall-count-label">Total Items</p>
            </div>
            <div className="stall-count-group">
              <p className="stall-count">{categoryCount}</p>
              <p className="stall-count-label">Category</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
