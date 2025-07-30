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
    setMenuOpen(false);
  };

  return (
    <nav className="stall-navbar">
      {/* Left: User icon */}
      <Link to="/profile" className="user-link" onClick={handleLinkClick}>
        <FaUserCircle className="user-icon" />
      </Link>

      {/* Center: App name */}
      <div className="stall-logo">Fliplyn</div>

      {/* Right: Hamburger */}
      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Links (dropdown for mobile) */}
      <div className={`stall-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/stalls" onClick={handleLinkClick}>Home</Link>
        <Link to="/cart" onClick={handleLinkClick}>Cart</Link>
        <Link to="/transactions-wallet" onClick={handleLinkClick}>Wallet</Link>
        <Link to="/trans" onClick={handleLinkClick}>Transaction History</Link>
      </div>
    </nav>
  );
}
