// src/App.js

import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import OfflinePopup from "./Component/OffLinePopup/OfflinePopup";

import LoadingScreen from "./Component/LoadingScreen/LoadingScreen";
import SignIn from "./Component/SignIn/SignIn";
import SignUp from "./Component/SignUp/SignUp";
import OtpVerify from "./Component/OTP/OTP";
import SelectCountry from "./Component/Country/Country";
import SelectCity from "./Component/City/City";
import ConfirmLocation from "./Component/Location/Location";
import Stall from "./Component/Pages/Stalls/Stalls";
import Category from "./Component/Pages/Category/Category";
import Cart from "./Component/Pages/Cart/Cart";
import PaymentMethodPage from "./Component/Pages/PaymentPage/Wallet";
import TransactionHistory from "./Component/Pages/TransactionHistory/TransactionHistory";
import PaymentSuccess from "./Component/Pages/Success/Success";
import PaymentSuccessCashfree from "./Component/Pages/Success/SuccessCashfree";
import Profile from "./Component/Pages/Profile/Profile";
import Transactions from "./Component/Pages/Transactions/Transactions";
import VerifyOTP from "./Component/SignIn/VerifyOTP";
import { AuthProvider } from "./Component/AuthContext/ContextApi";
import ForgotPassword from "./Component/SignIn/ForgotPassword";
import VerifyOTPPassword from "./Component/SignIn/VerifyOTPPassword";
import ChangePassword from "./Component/SignIn/ChangePassword";
import ReceiptPage from "./Component/Pages/Success/RecepitPage";
import QRScannerPage from "./Component/Pages/ScanQR/ScanQR";
import PolicyReview from "./Component/Policy/Policy";
// import InstallButton from './installbutton';

function PublicRoute({ children }) {
  return children;
}

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return <LoadingScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <>
      {/* ✅ Global Offline Popup */}
      <OfflinePopup isOffline={isOffline} />

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
        <Route path="/select-country" element={<SelectCountry />} />
        <Route path="/select-city" element={<SelectCity />} />
        <Route path="/confirm-location" element={<ConfirmLocation />} />
        <Route path="/stalls" element={<Stall />} />
        <Route path="/categories/:stallId" element={<Category />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wallet" element={<PaymentMethodPage />} />
        <Route path="/transactions-wallet" element={<TransactionHistory />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/success-payment" element={<PaymentSuccessCashfree />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trans" element={<Transactions />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp-password" element={<VerifyOTPPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
        <Route path="/policy" element={<PolicyReview />} />
        <Route path="/qr-scanner" element={<QRScannerPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        {/* <InstallButton /> */}
      </Router>
    </AuthProvider>
  );
}
