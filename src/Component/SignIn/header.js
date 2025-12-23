import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';
import logo from '../../assets/Images/Logo.png'; // adjust path if needed

export default function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="logo-wrapper">
        <img src={logo} alt="Fliplyn Logo" className="header-logo" />
        <span className="logo-text">Fliplyn</span>
      </Link>
    </header>
  );
}
