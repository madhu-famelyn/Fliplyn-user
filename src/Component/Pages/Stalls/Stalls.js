// src/pages/stalls/stall.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Stalls.css';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';

export default function Stall() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const buildingId = localStorage.getItem('selectedBuildingId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!buildingId) {
      navigate('/select-country');
      return;
    }

    axios
      .get(`http://127.0.0.1:8000/stalls/building/${buildingId}`)
      .then((res) => {
        if (!res.data || res.data.length === 0) {
          // ❌ No stalls for this building → clear and redirect
          localStorage.removeItem('selectedBuildingId');
          navigate('/select-country');
        } else {
          setStalls(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch stalls:', err);
        // On error also redirect to select-country
        localStorage.removeItem('selectedBuildingId');
        navigate('/select-country');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [buildingId, navigate]);

  const handleStallClick = (stallId) => {
    navigate(`/categories/${stallId}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="stall-wrapper">
          <p className="stall-empty">Loading stalls...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="stall-wrapper">
        <div className="stall-content">
          <div className="stall-head-wrapper">
            <h2 className="stall-headings">Explore Outlets</h2>
            <p className="stall-subtext">
              Browse menus and order your favorite meals.
            </p>
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
                    <div className="image-container">
                      <img
                        src={stall.image_url}
                        alt={stall.name}
                        className="stall-image"
                      />
                      <div className="view-menu-layout">View Menu</div>
                    </div>
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
