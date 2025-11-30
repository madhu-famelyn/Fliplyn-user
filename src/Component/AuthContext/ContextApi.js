// src/Component/AuthContext/ContextApi.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error('❌ Failed to parse user from localStorage:', err);
      localStorage.removeItem('user');
      return null;
    }
  });

  const isAuthenticated = !!token;

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    // Save to storage
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // 🔥 Console log user data
    console.log("🔐 Login Successful!");
    console.log("🧑 Name:", newUser.name);
    console.log("📧 Email:", newUser.email);
    console.log("📱 Phone:", newUser.phone_number);
    console.log("🏢 Company:", newUser.company_name);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
