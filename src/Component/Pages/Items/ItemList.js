import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Category/Category.css';
import { useAuth } from '../../AuthContext/ContextApi';
import './Items.css';

const S3_BASE_URL = 'https://fliplyn-assets.s3.ap-south-1.amazonaws.com/';

export default function ItemList({ items, itemsLoaded }) {
  const { user, token } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const res = await axios.get(`https://fliplyn.onrender.com/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const itemIds = res.data.items.map((item) => item.item_id);
      setCartItems(itemIds);
    } catch (err) {
      console.error('Failed to fetch cart items:', err);
    }
  };

  const handleAddToCart = async (itemId) => {
    const isInCart = cartItems.includes(itemId);

    if (isInCart) {
      try {
        await axios.delete(`https://fliplyn.onrender.com/cart/remove-item`, {
          data: {
            user_id: user.id,
            item_id: itemId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCartItems(cartItems.filter(id => id !== itemId));
        setPopupMessage('❌ Item removed from cart.');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
      } catch (err) {
        console.error('Failed to remove from cart:', err);
        setPopupMessage('❌ Failed to remove item.');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
      }

      return;
    }

    const payload = {
      user_id: user.id,
      items: [{ item_id: itemId, quantity: 1 }],
    };

    try {
      const response = await axios.post(
        'https://fliplyn.onrender.com/cart/add-multiple',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Added to cart:", response.data);
      setCartItems([...cartItems, itemId]);
      setPopupMessage('✅ Item added to cart!');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.error('❌ Failed to add to cart:', err);
      setPopupMessage('❌ Failed to add item.');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  return (
    <div className="items-section">
      {showPopup && <div className="cart-popup">{popupMessage}</div>}

      {itemsLoaded && items.length === 0 ? (
        <p className="no-items-text">No items available in this category.</p>
      ) : (
        <div className="item-grid">
          {items.map((item) => {
            const isInCart = cartItems.includes(item.id);
            return (
              <div key={item.id} className="item-card">
                <img
                  src={
                    item.image_url?.startsWith('http')
                      ? item.image_url
                      : `${S3_BASE_URL}${item.image_url}`
                  }
                  alt={item.name}
                  className="item-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/fallback-image.jpg';
                  }}
                />
                <div className="item-infermation">
                  <h4 className="item-names">{item.name}</h4>
                  <p className="item-prices">₹{item.price}</p>

                  <button
                    className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
                    onClick={() => handleAddToCart(item.id)}
                  >
                    {isInCart ? 'Remove' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
