import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../Header/Header';
import { useAuth } from '../../AuthContext/ContextApi';
import { FaTrash } from 'react-icons/fa';
import './Cart.css';
import { useNavigate } from 'react-router-dom';

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
      const res = await axios.get(`https://fliplyn.onrender.com/cart/${user.id}`, {
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
      axios.get(`https://fliplyn.onrender.com/items/items/${item.item_id}`)
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
      <h2 className="cart-title">Your Cart</h2>

      {loading ? (
        <div className="cart-container">Loading cart...</div>
      ) : error || !cart || cart.items.length === 0 ? (
        <div className="cart-container empty">
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-grid">
            {cart.items.map((item) => {
              const itemData = itemDetails[item.item_id];
              const itemTotal = item.quantity * item.price_at_addition;

              return (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-left">
                    <img
                      src={`https://fliplyn.onrender.com/${itemData?.image_url}`}
                      alt={itemData?.name}
                      className="cart-item-image"
                    />
                    <div>
                      <h3 className="item-name">{itemData?.name}</h3>
                      <p className="item-price">₹ {item.price_at_addition}</p>
                      <input
                        className="note-input"
                        placeholder="Order Note..."
                        disabled
                      />
                    </div>
                  </div>


                  <div className="cart-item-right">
                    <div className="quantity-total-row">
                      <div className="quantity-box">
                        <button onClick={() => updateQuantity(item.item_id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.item_id, item.quantity + 1)}>+</button>
                      </div>
                      <p className="item-total">₹ {itemTotal.toFixed(2)}</p>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() => updateQuantity(item.item_id, 0)}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <p>{cart.items.length} items</p>
            <p className="grand-total">
              Total: ₹{' '}
              {cart.items
                .reduce(
                  (total, item) => total + item.quantity * item.price_at_addition,
                  0
                )
                .toFixed(2)}
            </p>
          </div>

          <div className="cart-actions">
            <button className="cancel-btn">Cancel</button>
            <button className="pay-btn" onClick={() => navigate('/wallet')}>
              Continue to Payment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
