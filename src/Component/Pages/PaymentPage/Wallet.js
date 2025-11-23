import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Header/Header';
import './Wallet.css';
import { FaWallet } from 'react-icons/fa';
import { SiPhonepe } from 'react-icons/si';
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
    { label: 'Wallet', icon: <FaWallet /> },
    { label: 'Payment Gateway', icon: <SiPhonepe /> }
  ];

  // ✅ Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const [walletRes, userRes, cartRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/wallets/${userId}`),
          axios.get(`http://127.0.0.1:8000/user/${userId}`),
          axios.get(`http://127.0.0.1:8000/cart/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setWalletBalance(walletRes.data.balance_amount || 0);
        setUserDetails({
          phone_number: userRes.data.phone_number || '',
          company_email: userRes.data.company_email || ''
        });
        setCartItems(cartRes.data.items || []);
      } catch (err) {
        console.error('Fetch failed', err);
      }
    };

    fetchData();
  }, [userId, token]);

  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.item_price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  // ✅ UPDATED Razorpay Payment Handler (Backend Compatible)
  const handleRazorpayPayment = async (orderPayload) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load');
      return;
    }

    try {
      // 1️⃣ First create order in backend
      const orderRes = await axios.post(
        'http://127.0.0.1:8000/orders/place',
        orderPayload
      );

      const createdOrder = orderRes.data;
      const orderId = createdOrder.id;

      // 2️⃣ Create Razorpay order from backend
      const razorpayRes = await axios.post(
        'http://127.0.0.1:8000/orders/create-razorpay-order',
        { order_id: orderId }
      );

      const {
        razorpay_order_id,
        amount,
        currency,
        key_id
      } = razorpayRes.data;

      const options = {
        key: key_id,
        amount,
        currency,
        name: 'Fiplyn',
        description: 'Order Payment',
        order_id: razorpay_order_id,

        handler: async function () {
          try {
            await axios.delete(`http://127.0.0.1:8000/cart/clear/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.removeItem('cartItems');
            localStorage.removeItem('cart');
            setCartItems([]);

            navigate('/success', { state: { order: createdOrder } });
          } catch (err) {
            console.error('Post-payment cleanup failed', err);
            alert('Payment succeeded but cleanup failed.');
          }
        },

        prefill: {
          contact: userDetails.phone_number,
          email: userDetails.company_email
        },

        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      setErrorMsg('⚠️ Failed to start UPI payment');
    }
  };

  // ✅ Main Payment Handler
  const handleConfirmPayment = async () => {
    setErrorMsg('');
    const totalAmount = calculateTotalAmount();

    const itemsPayload = cartItems.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity
    }));

    const orderPayload = {
      user_id: userId,
      user_phone: userDetails.phone_number,
      user_email: userDetails.company_email,
      items: itemsPayload,
      pay_with_wallet: selectedMethod === 'Wallet'
    };

    // ✅ Wallet Flow
    if (selectedMethod === 'Wallet') {
      if (totalAmount > walletBalance) {
        setErrorMsg(`❌ Insufficient Wallet Balance`);
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.post('http://127.0.0.1:8000/orders/place', orderPayload);

        await axios.delete(`http://127.0.0.1:8000/cart/clear/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        localStorage.removeItem('cartItems');
        localStorage.removeItem('cart');
        setCartItems([]);

        navigate('/success', { state: { order: res.data } });
      } catch (err) {
        console.error(err);
        setErrorMsg('⚠️ Order failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ✅ UPDATED Razorpay Flow
    if (selectedMethod === 'Payment Gateway') {
      handleRazorpayPayment(orderPayload);
    }
  };

  return (
    <>
      <Header />

      <div className="payment-page-container">
        <h2 className="payment-title">Payment</h2>

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
          </div>
        )}

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <div className="payment-buttons">
          <button className="confirm-btn" onClick={handleConfirmPayment} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </button>

          <button className="continue-btn" onClick={() => navigate(-1)} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
