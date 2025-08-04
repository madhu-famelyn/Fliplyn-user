// src/pages/stalls/stall.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Stalls.css';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';

export default function Stall() {
  const [stalls, setStalls] = useState([]);
  const buildingId = localStorage.getItem('selectedBuildingId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!buildingId) return;

    axios
      .get(`https://fliplyn.onrender.com/stalls/building/${buildingId}`) // ✅ replace with your backend URL
      .then((res) => {
        setStalls(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch stalls:', err);
      });
  }, [buildingId]);

  const handleStallClick = (stallId) => {
    navigate(`/categories/${stallId}`);
  };

  return (
    <>
      <Header />

      <div className="stall-wrapper">
        <div className="stall-content">
          <div className="stall-heading-wrapper">
            <h2 className="stall-heading">Explore Outlets</h2>
            <p className="stall-subtext">Browse menus and order your favorite meals.</p>
          </div>

          {stalls.length === 0 ? (
            <p className="stall-empty">No stalls available in this building.</p>
          ) : (
            <div className="stall-grid">
              {stalls.map((stall) => (
                <div
                  className="stall-card-wrapper"
                  key={stall.id}
                  onClick={() => handleStallClick(stall.id)}
                >
                  <div className="stall-card">
                    <img
                      src={stall.image_url} // ✅ USE AWS URL directly
                      alt={stall.name}
                      className="stall-image"
                    />
                    <div className="view-menu-overlay">View Menu</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
