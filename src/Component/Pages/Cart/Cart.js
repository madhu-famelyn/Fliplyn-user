// src/pages/Cart.js or wherever this file is
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../Header/Header';
import { useAuth } from '../../AuthContext/ContextApi';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./Cart.css";

const S3_BASE_URL = 'https://fliplyn-assets.s3.ap-south-1.amazonaws.com/';

export default function Cart() {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(null);
  const [itemDetails, setItemDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchCart();
  }, [user, token]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedCart = res.data;
      const itemMap = await fetchItemDetails(fetchedCart.items);
      setCart(fetchedCart);
      setItemDetails(itemMap);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('No items in cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemDetails = async (cartItems) => {
    const requests = cartItems.map((item) =>
      axios.get(`/items/items/${item.item_id}`)
    );
    const responses = await Promise.all(requests);
    const itemMap = {};
    responses.forEach((res) => {
      const item = res.data;
      itemMap[item.id] = item;
    });
    return itemMap;
  };

  const updateQuantity = async (item_id, quantity) => {
    if (quantity < 0) return;

    try {
      await axios.put(
        'https://fliplyn.onrender.com/cart/update-quantity',
        {
          user_id: user.id,
          item_id,
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity');
    }
  };

  return (
    <>
      <Header />
      <h2 className='heading'>Your Cart</h2>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading cart...</div>
      ) : error || !cart || cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Your cart is empty.</div>
      ) : (
        <div className="cart-wrapper">
          <div className="cart-grid">
            {cart.items.map((item) => {
              const itemData = itemDetails[item.item_id];
              const itemTotal = item.quantity * item.price_at_addition;

              const imageUrl = itemData?.image_url?.startsWith('http')
                ? itemData.image_url
                : `${S3_BASE_URL}${itemData?.image_url}`;

              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-row">
                    <img
                      src={imageUrl}
                      alt={itemData?.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/fallback-item.jpg'; // optional fallback
                      }}
                    />
                    <div className="item-info">
                      <p className="item-name">{itemData?.name}</p>
                      <p className="item-price">₹ {item.price_at_addition}</p>
                    </div>
                    <div className="quantity-box">
                      <button onClick={() => updateQuantity(item.item_id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.item_id, item.quantity + 1)}>+</button>
                    </div>
                    <p className="item-total">
                      ₹ {Number.isInteger(itemTotal) ? itemTotal : itemTotal.toFixed(2)}
                    </p>
                  </div>

                  <button
                    className="remove-button"
                    onClick={() => updateQuantity(item.item_id, 0)}
                    title="Remove item"
                  >
                    Remove from Cart
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <p>{cart.items.length} items</p>
            <p>
              Total: ₹{' '}
              {cart.items
                .reduce((total, item) => total + item.quantity * item.price_at_addition, 0)
                .toFixed(2)}
            </p>
          </div>

          <div className="cart-actions">
            <button className="cancel-button" onClick={() => navigate(-1)}>Cancel</button>
            <button className="proceed-button" onClick={() => navigate('/wallet')}>
              Continue to Payment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
