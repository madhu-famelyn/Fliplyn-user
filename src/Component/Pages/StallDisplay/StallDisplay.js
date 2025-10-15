// src/components/StallDisplay.js
import React from 'react';
import './StallDisplay.css';
import '../../fonts.css';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';

export default function StallDisplay({
  name = '',
  description = '',
  imageUrl = ''
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoIosArrowBack style={{ marginRight: '8px' }} />
          <span>{name}</span>
          <span className="dots" /> 
          <span className="store-text">store</span>
        </button>
      </div>

      {/* ✅ Stall Banner */}
      <div
        className="stall-banner"
        style={{ backgroundImage: `url(${imageUrl})` }} // full image, no overlay
      >
        <div className="stall-banner-overlay">
          <div className="stall-info-left">
            {/* Optional subtitle if needed */}
            {/* <p className="stall-subtitle">{description}</p> */}
          </div>
        </div>
      </div>
    </>
  );
}
