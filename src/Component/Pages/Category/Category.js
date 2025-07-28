// src/pages/Category/Category.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Category.css';
import Header from '../Header/Header';
import StallDisplay from '../StallDisplay/StallDisplay';
import CategoryList from './CategoryList';
import ItemList from '../Items/ItemList';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';



export default function Category() {
  const { stallId } = useParams();
  const [categories, setCategories] = useState([]);
  const [stallDetails, setStallDetails] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (stallId) {
      axios
        .get(`http://localhost:8000/categories/stall/${stallId}`)
        .then((res) => {
          setCategories(res.data);
          if (res.data.length > 0) {
            setSelectedCategoryId(res.data[0].id);
          }
        })
        .catch((err) => console.error('Error fetching categories:', err));

      axios
        .get(`http://localhost:8000/stalls/${stallId}`)
        .then((res) => setStallDetails(res.data))
        .catch((err) => console.error('Error fetching stall details:', err));

      axios
        .get(`http://localhost:8000/items/stall/${stallId}`)
        .then((res) => setItemCount(res.data.length))
        .catch((err) => console.error('Error fetching item count:', err));
    }
  }, [stallId]);

  useEffect(() => {
    if (selectedCategoryId) {
      axios
        .get(`http://localhost:8000/items/items/category/${selectedCategoryId}/availability?is_available=true`)
        .then((res) => {
          setItems(res.data);
          setItemsLoaded(true);
        })
        .catch((err) => {
          console.error('Error fetching items:', err);
          setItems([]);
          setItemsLoaded(true);
        });
    }
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
        {stallDetails && (
          <StallDisplay
            name={stallDetails.name}
            description={stallDetails.description}
            imageUrl={stallDetails.image_url}
            categoryCount={categories.length}
            itemCount={itemCount}
          />
        )}

        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryClick={handleCategoryClick}
        />

        <div className="menu-header">
          <h2 className="menu-title">Menu</h2>
<button className="view-cart-btn" onClick={() => navigate('/cart')}>
  <FiShoppingCart color="#fff" size={16} />
  View Cart
</button>


        </div>

        <ItemList items={items} itemsLoaded={itemsLoaded} />
      </div>
    </div>
  );
} 

