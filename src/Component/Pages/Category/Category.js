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

const BASE_URL = 'https://admin-aged-field-2794.fly.dev';

export default function Category() {
  const { stallId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [stallDetails, setStallDetails] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);

  // 🔁 Fetch categories, stall info, and total item count
  useEffect(() => {
    if (!stallId) return;

    // Fetch categories
    axios.get(`${BASE_URL}/categories/stall/${stallId}`)
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategoryId(res.data[0].id);
        }
      })
      .catch((err) => console.error('❌ Error fetching categories:', err));

    // Fetch stall details
    axios.get(`${BASE_URL}/stalls/${stallId}`)
      .then((res) => setStallDetails(res.data))
      .catch((err) => console.error('❌ Error fetching stall details:', err));

    // Fetch item count
    axios.get(`${BASE_URL}/items/stall/${stallId}`)
      .then((res) => setItemCount(res.data.length))
      .catch((err) => console.error('❌ Error fetching item count:', err));
  }, [stallId]);

  // 🔁 Fetch items when category changes
  useEffect(() => {
    if (!selectedCategoryId) return;

    axios.get(`${BASE_URL}/items/items/category/${selectedCategoryId}/availability?is_available=true`)
      .then((res) => {
        setItems(res.data);
        setItemsLoaded(true);
      })
      .catch((err) => {
        console.error('❌ Error fetching items:', err);
        setItems([]);
        setItemsLoaded(true);
      });
  }, [selectedCategoryId]);

  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id);
    setItems([]);
    setItemsLoaded(false);
  };

  return (
    <div>
      <Header />

      <div className="category-wrapper">
        {/* 🏪 Stall Banner Display */}
        {stallDetails && (
          <StallDisplay
            name={stallDetails.name}
            description={stallDetails.description}
            imageUrl={stallDetails.image_url} 
            categoryCount={categories.length}
            itemCount={itemCount}
          />
        )}

        {/* 🗂️ Categories */}
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryClick={handleCategoryClick}
        />

        {/* 🍽️ Menu + View Cart */}
        <div className="menu-header">
          <h2 className="menu-title">Menu</h2>
          <button className="view-cart-btn" onClick={() => navigate('/cart')}>
            <FiShoppingCart color="#fff" size={16} />
            View Cart
          </button>
        </div>

        {/* 🧾 Items */}
        <ItemList items={items} itemsLoaded={itemsLoaded} />
      </div>
    </div>
  );
}
