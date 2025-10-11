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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        const [walletRes, userRes] = await Promise.all([
          axios.get(`https://admin-aged-field-2794.fly.dev/wallets/${userId}`),
          axios.get(`https://admin-aged-field-2794.fly.dev/user/${userId}`),
        ]);

        setWalletBalance(walletRes.data.balance_amount || 0);
        setUserDetails({
          phone_number: userRes.data.phone_number || '',
          company_email: userRes.data.company_email || '',
        });
      } catch (err) {
        console.error('Failed to fetch wallet or user info', err);
      }
    };

    const fetchCartItems = async () => {
      try {
        const res = await axios.get(`https://admin-aged-field-2794.fly.dev/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to fetch cart items:', err);
      }
    };

    fetchWalletAndUser();
    fetchCartItems();
  }, [userId, token]);

  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.item_price || 0; // fallback key
      return total + price * item.quantity;
    }, 0);
  };

  const handleConfirmPayment = async () => {
    setErrorMsg('');
    const totalAmount = calculateTotalAmount();

    // 🧮 Check for insufficient wallet balance before sending request
    if (selectedMethod === 'Wallet' && totalAmount > walletBalance) {
      setErrorMsg(
        `❌ Insufficient Wallet Balance! Wallet: ₹${walletBalance.toFixed(
          2
        )}, Order Total: ₹${totalAmount.toFixed(2)}`
      );
      return;
    }

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

    console.log('🛒 Sending order payload:', requestBody);
    setIsLoading(true);

    try {
      const res = await axios.post('https://admin-aged-field-2794.fly.dev/orders/place', requestBody);
      console.log('✅ Order success:', res.data);

      await axios.delete(`https://admin-aged-field-2794.fly.dev/cart/clear/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/success', { state: { order: res.data } });
    } catch (err) {
      console.error('❌ Order failed:', err);

      if (err.response) {
        const { detail } = err.response.data;

        // 🎯 Handle insufficient wallet balance specifically
        if (detail === 'Insufficient wallet balance') {
          setErrorMsg(
            `❌ Insufficient Wallet Balance! Wallet: ₹${walletBalance.toFixed(2)}`
          );
        } else {
          setErrorMsg(`⚠️ ${detail || 'Unexpected error occurred.'}`);
        }
      } else {
        setErrorMsg('⚠️ Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {selectedMethod === 'Wallet' && (
          <div className="wallet-section">
            <p className="wallet-label">Wallet Balance</p>
            <p className="wallet-amount">₹{walletBalance.toFixed(2)}</p>
            <button
              className="go-to-wallet-btn"
              onClick={() => navigate('/transactions-wallet')}
              disabled={isLoading}
            >
              Go to Wallet
            </button>
          </div>
        )}

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <div className="payment-buttons">
          <button
            className="confirm-btn"
            onClick={handleConfirmPayment}
            disabled={isLoading}
          >                                       
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </button>
          <button
            className="continue-btn"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
