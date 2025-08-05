// src/App.js
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import VerifyOTP from './Component/SignIn/VerifyOTP';
import { AuthProvider, useAuth } from './Component/AuthContext/ContextApi';

function PublicRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (token && location.pathname === "/") {
    return <Navigate to="/select-country" replace />;
  }

  return children;
}

function AppContent() {
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && token && location.pathname === "/") {
      window.location.replace("/select-country");
    }
  }, [loading, token, location.pathname]);

  if (loading) {
    return <LoadingScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/signup-page" element={<SignUp />} />
      <Route path="/otp" element={<OtpVerify />} />

      {/* All Routes (no ProtectedRoute anymore) */}
      <Route path="/select-country" element={<SelectCountry />} />
      <Route path="/select-city" element={<SelectCity />} />
      <Route path="/confirm-location" element={<ConfirmLocation />} />
      <Route path="/stalls" element={<Stall />} />
      <Route path="/categories/:stallId" element={<Category />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wallet" element={<PaymentMethodPage />} />
      <Route path="/transactions-wallet" element={<TransactionHistory />} />
      <Route path="/success" element={<PaymentSuccess />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/trans" element={<Transactions />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
