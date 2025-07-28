// src/pages/ConfirmLocation.js
import React, { useState, useEffect } from 'react';
import './Location.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ConfirmLocation() {
  const navigate = useNavigate();

  const [buildingName, setBuildingName] = useState('');
  const [buildingList, setBuildingList] = useState([]);
  const country = 'India';
  const city = localStorage.getItem('selectedCity') || '';
  const cityCode = localStorage.getItem('selectedCityCode') || '';

  useEffect(() => {
    if (!city) {
      navigate('/select-city');
    }
  }, [city, navigate]);

  useEffect(() => {
    if (cityCode) {
      axios
        .get(`http://localhost:8000/buildings/by-city-identifier/${cityCode}`)
        .then((res) => {
          setBuildingList(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch buildings:', err);
        });
    }
  }, [cityCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buildingName.trim()) return;

    const selectedBuilding = buildingList.find(
      (b) => b.building_name.toLowerCase() === buildingName.toLowerCase()
    );

    if (!selectedBuilding) return;

    localStorage.setItem('selectedBuilding', selectedBuilding.building_name);
    localStorage.setItem('selectedBuildingId', selectedBuilding.id);

    navigate('/stalls');
  };

  return (
    <div className="confirm-wrapper">
      <div className="confirm-box">
        <h2 className="confirm-title">Confirm Your Location</h2>
        <p className="confirm-subtitle">Enter your building to get started</p>

        <div className="confirm-info">
          <div className="confirm-label">Country</div>
          <div className="confirm-value">{country}</div>

          <div className="confirm-label">City</div>
          <div className="confirm-value">{city}</div>

          <div className="confirm-label">Building name</div>
          <input
            type="text"
            list="building-options"
            className="confirm-input"
            placeholder="Enter or select building"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
          />
          <datalist id="building-options">
            {buildingList.map((building) => (
              <option key={building.id} value={building.building_name} />
            ))}
          </datalist>
        </div>

        <button className="confirm-button" onClick={handleSubmit}>
          Let’s Go
        </button>
      </div>
    </div>
  );
}
