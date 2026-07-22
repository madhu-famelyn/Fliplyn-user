// src/Component/AuthContext/ContextApi.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE = 'https://admin-aged-field-2794.fly.dev';

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

  // 🔁 On app startup: if logged in but building_id missing, fetch it from API
  useEffect(() => {
    const refreshUserIfNeeded = async () => {
      if (!token || !user?.id) return;
      if (user?.building_id) {
        // Already have building_id — set it in localStorage just in case
        localStorage.setItem('selectedBuildingId', user.building_id);
        return;
      }
      // building_id missing from stored user — fetch fresh profile
      try {
        const res = await axios.get(`${API_BASE}/user/${user.id}`);
        const freshUser = res.data;
        if (freshUser?.building_id) {
          const updatedUser = { ...user, ...freshUser };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('selectedBuildingId', freshUser.building_id);
          console.log('✅ User building_id refreshed:', freshUser.building_id);
        }
      } catch (err) {
        console.error('❌ Failed to refresh user profile:', err);
      }
    };

    refreshUserIfNeeded();
  }, [token, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    // Save to storage
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newUser?.building_id) {
      localStorage.setItem('selectedBuildingId', newUser.building_id);
    }

    // 🔥 Console log user data
    console.log("🔐 Login Successful!");
    console.log("🧑 Name:", newUser.name);
    console.log("📧 Email:", newUser.email);
    console.log("📱 Phone:", newUser.phone_number);
    console.log("🏢 Company:", newUser.company_name);
    console.log("🏗️ Building:", newUser.building_id);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBuildingId');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
