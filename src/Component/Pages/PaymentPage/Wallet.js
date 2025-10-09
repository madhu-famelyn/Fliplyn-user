import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Header/Header';
import './Wallet.css';
import { FaQrcode, FaWallet, FaCreditCard } from 'react-icons/fa';
import { MdOutlinePayments } from 'react-icons/md';
import { RiGroupLine } from 'react-icons/ri';
import { useAuth } from '../../AuthContext/ContextApi';
import { useNavigate } from 'react-router-dom';

export default function PaymentMethodPage() {
  const { user, token } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('Wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [userDetails, setUserDetails] = useState({ phone_number: '', company_email: '' });
  const [cartItems, setCartItems] = useState([]);

  const userId = user?.id;
  const navigate = useNavigate();

  const paymentMethods = [
    { label: 'QR Code', icon: <FaQrcode /> },
    { label: 'Wallet', icon: <FaWallet /> },
    { label: 'UPI', icon: <MdOutlinePayments /> },
    { label: 'Card', icon: <FaCreditCard /> },
    { label: 'Split Pay', icon: <RiGroupLine /> },
  ];

useEffect(() => {
  if (!userId) return;

const fetchWalletAndUser = async () => {
  try {
    console.log(`📡 Fetching wallet for building_id: ${user?.building_id}`);
    console.log(`URL: https://admin-aged-field-2794.fly.dev/wallets/by-building/${user?.building_id}`);

    const walletRes = await axios.get(
      `https://admin-aged-field-2794.fly.dev/wallets/by-building/${user?.building_id}`
    );

    const wallets = walletRes.data;
    const wallet = Array.isArray(wallets) ? wallets[0] : wallets;

    if (wallet) {
      console.log("✅ Wallet found:", wallet);
      setWalletBalance(wallet.balance_amount || 0);
    } else {
      console.warn("⚠️ No wallet found for this building.");
      setWalletBalance(0);
    }

    console.log(`📡 Fetching user details for userId: ${userId}`);
    const userRes = await axios.get(
      `https://admin-aged-field-2794.fly.dev/user/${userId}`
    );
    console.log("✅ User response:", userRes.data);

    setUserDetails({
      phone_number: userRes.data.phone_number || "",
      company_email: userRes.data.company_email || "",
    });
  } catch (err) {
    console.error("❌ Failed to fetch wallet or user info", err);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Status:", err.response.status);
    }
  }
};

  const fetchCartItems = async () => {
    try {
      console.log(`📡 Fetching cart items for userId: ${userId}`);
      const res = await axios.get(`https://admin-aged-field-2794.fly.dev/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Cart items response:', res.data);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('❌ Failed to fetch cart items:', err);
    }
  };

  fetchWalletAndUser();
  fetchCartItems();
}, [userId, token]);


const handleConfirmPayment = async () => {
  const itemsPayload = cartItems.map((item) => ({
    item_id: item.item_id,
    quantity: item.quantity,
  }));

  const requestBody = {
    user_id: userId,
    user_phone: userDetails.phone_number,
    user_email: userDetails.company_email,
    items: itemsPayload,
    pay_with_wallet: selectedMethod === 'Wallet',
  };

  // ✅ Log request before sending
  console.log("🛒 Sending order payload to backend:");
  console.log("URL:", "https://admin-aged-field-2794.fly.dev/orders/place");
  console.log("Payload:", JSON.stringify(requestBody, null, 2));

  try {
    const res = await axios.post(
      "https://admin-aged-field-2794.fly.dev/orders/place",
      requestBody
    );

    console.log("✅ Order success:", res.data);

    // Clear cart after successful order
    await axios.delete(`https://admin-aged-field-2794.fly.dev/cart/clear/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    navigate("/success", { state: { order: res.data } });
  } catch (err) {
    console.error("❌ Order failed with error:", err);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Status:", err.response.status);
      console.error("Headers:", err.response.headers);
    }
  }
};

  return (
    <>
      <Header />
      <div className="payment-page-container">
        <h2 className="payment-title">Payment</h2>
        <p className="payment-subtitle">{paymentMethods.length} payment methods available</p>

        <div className="method-label">Payment Method</div>
        <div className="payment-methods">
          {paymentMethods.map(({ label, icon }) => (
            <button
              key={label}
              className={`method-btn ${selectedMethod === label ? 'selected' : ''}`}
              onClick={() => setSelectedMethod(label)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {selectedMethod === 'Wallet' && (
          <div className="wallet-section">
            <p className="wallet-label">Wallet Balance</p>
            <p className="wallet-amount">₹{walletBalance}</p>
            <button
              className="go-to-wallet-btn"
              onClick={() => navigate('/transactions-wallet')}
            >
              Go to Wallet
            </button>
          </div>
        )}

        <div className="payment-buttons">
          <button className="confirm-btn" onClick={handleConfirmPayment}>
            Confirm Payment
          </button>
          <button className="continue-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
    </>
  );
}
