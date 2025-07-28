// src/App.js
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import LoadingScreen from './Component/LoadingScreen/LoadingScreen';
import SignIn from './Component/SignIn/SignIn';
import SignUp from './Component/SignUp/SignUp';
import OtpVerify from './Component/OTP/OTP';
import SelectCountry from './Component/Country/Country';
import SelectCity from './Component/City/City';
import ConfirmLocation from './Component/Location/Location';
import Stall from './Component/Pages/Stalls/Stalls';
import Category from './Component/Pages/Category/Category';
import Cart from './Component/Pages/Cart/Cart';
import PaymentMethodPage from './Component/Pages/PaymentPage/Wallet';
import TransactionHistory from './Component/Pages/TransactionHistory/TransactionHistory';
import PaymentSuccess from './Component/Pages/Success/Success';
import Profile from './Component/Pages/Profile/Profile';
import Transactions from './Component/Pages/Transactions/Transactions';

import { AuthProvider, useAuth } from './Component/AuthContext/ContextApi';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/signin" replace />;
}

function AppContent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/otp" element={<OtpVerify />} />

      {/* Protected Routes */}
      <Route
        path="/select-country"
        element={
          <ProtectedRoute>
            <SelectCountry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/select-city"
        element={
          <ProtectedRoute>
            <SelectCity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirm-location"
        element={
          <ProtectedRoute>
            <ConfirmLocation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stalls"
        element={
          <ProtectedRoute>
            <Stall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories/:stallId"
        element={
          <ProtectedRoute>
            <Category />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <PaymentMethodPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions-wallet"
        element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trans"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
