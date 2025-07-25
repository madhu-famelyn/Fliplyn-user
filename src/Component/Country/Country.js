// src/pages/SelectCountry.js
import React from 'react';
import './Country.css';
import { useNavigate } from 'react-router-dom';

const countries = [
  'India', 'Kenya', 'UAE', 'Philippines', 'Canada', 'Malaysia',
  'KSA', 'Bahrain', 'Nepal', 'Ireland', 'USA', 'Nigeria',
  'Finland', 'China', 'Japan', 'Denmark', 'France', 'South Korea',
];

const countryCodeMap = {
  india: 'in', kenya: 'ke', uae: 'ae', philippines: 'ph', canada: 'ca',
  malaysia: 'my', ksa: 'sa', bahrain: 'bh', nepal: 'np', ireland: 'ie',
  usa: 'us', nigeria: 'ng', finland: 'fi', china: 'cn', japan: 'jp',
  denmark: 'dk', france: 'fr', 'south korea': 'kr',
};

export default function SelectCountry() {
  const navigate = useNavigate();

  const handleCountryClick = (country) => {
    if (country === 'India') {
      navigate('/select-city', { state: { country } });
    } else {
      alert('Right now no buildings in that country.');
    }
  };

  return (
    <div className="country-wrapper">
      <div className="country-header">Fliplyne</div>
      <div className="country-content">
        <h2 className="country-title">Select Your Country</h2>
        <div className="country-grid">
          {countries.map((name) => {
            const code = countryCodeMap[name.toLowerCase()];
            return (
              <div
                className="country-card"
                key={name}
                onClick={() => handleCountryClick(name)}
              >
                <img
                  className="country-flag"
                  src={`https://flagcdn.com/w40/${code}.png`}
                  alt={`${name} flag`}
                />
                <span className="country-name">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
