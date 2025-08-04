import React, { useState } from 'react';
import axios from 'axios';
import '../Category/Category.css';
import { useAuth } from '../../AuthContext/ContextApi';
import './Items.css';

const S3_BASE_URL = 'https://fliplyn-assets.s3.ap-south-1.amazonaws.com/';

export default function ItemList({ items, itemsLoaded }) {
  const { user, token } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleAddToCart = async (itemId) => {
    const payload = {
      user_id: user.id,
      items: [
        {
          item_id: itemId,
          quantity: 1,
        },
      ],
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
        <p className="no-items-text">
          No items available in this category.
        </p>
      ) : (
        <div className="item-grid">
          {items.map((item) => (
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
                  e.target.src = '/fallback-image.jpg'; // optional fallback
                }}
              />
              <div className="item-info">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-price">₹{item.price}</p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(item.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
