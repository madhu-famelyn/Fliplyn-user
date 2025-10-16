// src/pages/Category/Category.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Category.css';
import Header from '../Header/Header';
import StallDisplay from '../StallDisplay/StallDisplay';
import CategoryList from './CategoryList';
import ItemList from '../Items/ItemList';
import { FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../../AuthContext/ContextApi';

const BASE_URL = 'https://admin-aged-field-2794.fly.dev';

export default function Category() {
  const { stallId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [stallDetails, setStallDetails] = useState(null);
  const [, setItemCount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // 🔁 Fetch categories, stall info, total items
  useEffect(() => {
    if (!stallId) return;

    // Fetch categories
    axios.get(`${BASE_URL}/categories/stall/${stallId}`)
      .then(res => {
        setCategories(res.data);
        if (res.data.length > 0) setSelectedCategoryId(res.data[0].id);
      })
      .catch(err => console.error('❌ Error fetching categories:', err));

    // Fetch stall details
    axios.get(`${BASE_URL}/stalls/${stallId}`)
      .then(res => setStallDetails(res.data))
      .catch(err => console.error('❌ Error fetching stall details:', err));

    // Fetch total items in stall
    axios.get(`${BASE_URL}/items/stall/${stallId}`)
      .then(res => setItemCount(res.data.length))
      .catch(err => console.error('❌ Error fetching item count:', err));
  }, [stallId]);

  // 🔁 Fetch items for selected category
  useEffect(() => {
    if (!selectedCategoryId) return;

    axios.get(`${BASE_URL}/items/items/category/${selectedCategoryId}/availability?is_available=true`)
      .then(res => {
        setItems(res.data);
        setItemsLoaded(true);
      })
      .catch(err => {
        console.error('❌ Error fetching items:', err);
        setItems([]);
        setItemsLoaded(true);
      });
  }, [selectedCategoryId]);

  // 🔁 Fetch user's cart and compute total quantity
  useEffect(() => {
    if (!user?.id) return;

    axios.get(`${BASE_URL}/cart/${user.id}`)
      .then(res => {
        const totalItems = res.data?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartCount(totalItems);
      })
      .catch(err => {
        console.error('❌ Error fetching cart:', err);
        setCartCount(0);
      });
  }, [user]);

  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id);
    setItems([]);
    setItemsLoaded(false);
  };

  return (
    <div>
      <Header />

      <div className="category-wrapper">
        {/* Stall Banner */}
        {stallDetails && (
          <StallDisplay
            name={stallDetails.name}
            imageUrl={stallDetails.image_url}
          />
        )}

        {/* Categories */}
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryClick={handleCategoryClick}
        />

        {/* Menu Header + View Cart */}
<div className="menu-header">
  <h2 className="menu-title">Menu</h2>
  <button
    className={`view-cart-btn ${cartCount > 0 ? 'has-items' : ''}`}
    onClick={() => navigate('/cart')}
    key={cartCount} // triggers re-render for animation
  >
    <FiShoppingCart color="#fff" size={16} />
    {cartCount > 0 ? ` ${cartCount}` : 'Cart is empty'}
  </button>
</div>


        {/* Items */}
        <ItemList items={items} itemsLoaded={itemsLoaded} />
      </div>
    </div>
  );
}
