import React, { useState } from 'react';
import axios from 'axios';
import '../Category/Category.css';
import { useAuth } from '../../AuthContext/ContextApi';

export default function ItemList({ items, itemsLoaded }) {
  const { user, token } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleAddToCart = async (itemId) => {
    try {
      const payload = {
        user_id: user.id,
        items: [
          {
            item_id: itemId,
            quantity: 1,
          },
        ],
      };

      await axios.post('https://fliplyn.onrender.com/cart/add-multiple', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPopupMessage('Item added to cart!');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setPopupMessage('Failed to add item.');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  return (
    <div className="items-section">
      {showPopup && <div className="cart-popup">{popupMessage}</div>}
      {itemsLoaded && items.length === 0 ? (
<p
  style={{
    fontFamily: 'Helvetica Neue, sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    color: '#555',
    textAlign: 'center',
    marginTop: '40px',
    marginBottom: '20px',
    opacity: 0.8,
  }}
>
  No items available in this category.
</p>

      ) : (
        <div className="item-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <img
                src={`https://fliplyn.onrender.com/${item.image_url}`}
                alt={item.name}
                className="item-img"
              />
              <h4 className="item-name">{item.name}</h4>
              <p className="item-price">₹{item.price}</p>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(item.id)}
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}