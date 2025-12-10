// src/components/Header.js
import './Header.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="stall-navbar">
      {/* ✅ Mobile: Left - User Icon */}
      <div className="mobile-left mobile">
        <Link to="/profile">
          <FaUserCircle className="user-icon" />
        </Link>
      </div>

      {/* ✅ Center: Logo */}
      <div className="stall-logo">Fliplyn</div>

      {/* ✅ Mobile: Right - Hamburger */}
      <div className="mobile-right mobile" onClick={toggleMenu}>
        {menuOpen ? <FaTimes className="hamburger" /> : <FaBars className="hamburger" />}
      </div>

      {/* ✅ Desktop Nav */}
      <div className="stall-links desktop">
        <Link to="/stalls">Home</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/transactions-wallet">Wallet</Link>
        <Link to="/trans">Transaction History</Link>
        <Link to="/policy">Policy</Link>

        <Link className='user' to="/profile">
          <FaUserCircle className="user-icon" />
        </Link>
      </div>
     

      {/* ✅ Mobile Dropdown Nav */}
      <div className={`stall-links mobile-dropdown ${menuOpen ? 'open' : ''}`}>
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
