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
        const [walletRes, userRes] = await Promise.all([
          axios.get(`https://fliplyn.onrender.com/wallets/${userId}`),
          axios.get(`https://fliplyn.onrender.com/user/${userId}`),
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
        const res = await axios.get(`https://fliplyn.onrender.com/cart/${userId}`, {
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

    try {
      const res = await axios.post('https://fliplyn.onrender.com/orders/place', requestBody);
      console.log('Order placed:', res.data);

      await axios.delete(`https://fliplyn.onrender.com/cart/clear/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/success', { state: { order: res.data } });
    } catch (err) {
      console.error('Order failed:', err);
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
