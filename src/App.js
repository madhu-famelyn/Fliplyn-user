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

import { useAuth, AuthProvider } from './Component/AuthContext/ContextApi';

// 🔒 Wrapper for protected routes
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/signin" />;
}

function AppContent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/otp" element={<OtpVerify />} />

      {/* 🔐 Protected Routes */}
      <Route
        path="/select-country"
        element={
          <PrivateRoute>
            <SelectCountry />
          </PrivateRoute>
        }
      />
      <Route
        path="/select-city"
        element={
          <PrivateRoute>
            <SelectCity />
          </PrivateRoute>
        }
      />
      <Route
        path="/confirm-location"
        element={
          <PrivateRoute>
            <ConfirmLocation />
          </PrivateRoute>
        }
      />
      <Route
        path="/stalls"
        element={
          <PrivateRoute>
            <Stall />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories/:stallId"
        element={
          <PrivateRoute>
            <Category />
          </PrivateRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <PrivateRoute>
            <PaymentMethodPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/transactions-wallet"
        element={
          <PrivateRoute>
            <TransactionHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/success"
        element={
          <PrivateRoute>
            <PaymentSuccess />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/trans"
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
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
