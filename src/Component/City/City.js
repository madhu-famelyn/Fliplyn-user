// src/pages/SelectCity.js
import React, { useState } from 'react';
import './City.css';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';


const cityCodeMap = {
  "Hyderabad": "00001", "Mumbai": "00002", "Delhi": "00003", "Bengaluru": "00004", "Chennai": "00005",
  "Kolkata": "00006", "Pune": "00007", "Ahmedabad": "00008", "Jaipur": "00009", "Surat": "00010",
  "Lucknow": "00011", "Kanpur": "00012", "Nagpur": "00013", "Visakhapatnam": "00014", "Bhopal": "00015",
  "Patna": "00016", "Vadodara": "00017", "Ghaziabad": "00018", "Ludhiana": "00019", "Agra": "00020",
  "Nashik": "00021", "Faridabad": "00022", "Meerut": "00023", "Rajkot": "00024", "Kalyan-Dombivli": "00025",
  "Vasai-Virar": "00026", "Varanasi": "00027", "Srinagar": "00028", "Aurangabad": "00029", "Dhanbad": "00030",
  "Amritsar": "00031", "Navi Mumbai": "00032", "Allahabad": "00033", "Ranchi": "00034", "Howrah": "00035",
  "Coimbatore": "00036", "Jabalpur": "00037", "Gwalior": "00038", "Vijayawada": "00039", "Jodhpur": "00040",
  "Madurai": "00041", "Raipur": "00042", "Kota": "00043", "Guwahati": "00044", "Chandigarh": "00045",
  "Solapur": "00046", "Hubli–Dharwad": "00047", "Tiruchirappalli": "00048", "Bareilly": "00049", "Moradabad": "00050"
};

const popularCities = ["Bengaluru", "Mumbai", "Delhi", "Pune", "Chennai", "Hyderabad", "Gurugram"];
const allOtherCities = Object.keys(cityCodeMap).filter(city => !popularCities.includes(city));

export default function SelectCity() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMore, setShowMore] = useState(false);

  const handleCitySelect = (city) => {
    const code = cityCodeMap[city];
    if (code) {
      // Store in localStorage
      localStorage.setItem('selectedCity', city);
      localStorage.setItem('selectedCityCode', code);

      // Navigate to ConfirmLocation with state (optional)
      navigate('/confirm-location', {
        state: { city, code },
      });
    } else {
      alert('Right now no buildings in that city.');
    }
  };

  const filteredPopular = popularCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOther = allOtherCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="select-city-wrapper">
      <header className="city-header">Fliplyne</header>

      <main className="city-main">
        <h2 className="city-title">Select Your City</h2>
        <p className="city-subtitle">Choose from popular cities or search your city below.</p>

        <section className="city-section">
          <h4 className="city-label">Popular Cities</h4>
          <div className="city-grid">
            {filteredPopular.length > 0 ? (
              filteredPopular.map(city => (
                <button key={city} onClick={() => handleCitySelect(city)} className="city-button">
                  {city}
                </button>
              ))
            ) : (
              <p>No popular city found</p>
            )}
          </div>
        </section>

        <input
          className="city-search"
          placeholder="Search something here"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <section className="city-section">
          <h4 className="city-label">Other Cities</h4>
          <div className="city-grid">
            {(showMore ? filteredOther : filteredOther.slice(0, 15)).map(city => (
              <button key={city} onClick={() => handleCitySelect(city)} className="city-button">
                {city}
              </button>
            ))}

            {filteredOther.length > 15 && (
              <button className="city-showmore" onClick={() => setShowMore(!showMore)}>
              {showMore ? (
                <>
                  Show less <FaChevronUp />
                </>
              ) : (
                <>
                  Show more <FaChevronDown />
                </>
              )}
            </button>

            )}
          </div>
        </section>
      </main>
    </div>
  );
}
