// src/components/Header.js
import './Header.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLinkClick = () => {
    setMenuOpen(false); // close menu when a link is clicked
  };

  return (
    <nav className="stall-navbar">
      <div className="stall-logo">Fliplyn</div>

      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <div className={`stall-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/stalls" onClick={handleLinkClick}>Home</Link>
        <Link to="/cart" onClick={handleLinkClick}>Cart</Link>
        <Link to="/transactions-wallet" onClick={handleLinkClick}>Wallet</Link>
        <Link to="/trans" onClick={handleLinkClick}>Transaction History</Link>
        <Link to="/profile" onClick={handleLinkClick}>
          <FaUserCircle className="user-icon" />
        </Link>
      </div>
    </nav>
  );
}
