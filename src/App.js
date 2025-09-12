// src/App.js
import {  useState } from 'react';
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
import VerifyOTP from './Component/SignIn/VerifyOTP';
import { AuthProvider } from './Component/AuthContext/ContextApi';
import ForgotPassword from './Component/SignIn/ForgotPassword';
import VerifyOTPPassword from './Component/SignIn/VerifyOTPPassword';
import ChangePassword from './Component/SignIn/ChangePassword';
import ReceiptPage from './Component/Pages/Success/RecepitPage';
import QRScannerPage from './Component/Pages/ScanQR/ScanQR';

function PublicRoute({ children }) {
  // ✅ Removed token-based redirect logic so `/` always shows SignIn
  return children;
}

function AppContent() {
  const [loading, setLoading] = useState(true);

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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp-password" element={<VerifyOTPPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/receipt/:id" element={<ReceiptPage />} />
      {/* Fallback Route */}



      <Route path='/qr-scanner' element={<QRScannerPage/>}/>
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
