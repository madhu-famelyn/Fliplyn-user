// src/components/CategoryList.js
import React from 'react';
import './Category.css';

export default function CategoryList({ categories, selectedCategoryId, onCategoryClick }) {
  return (
    <div className="category-scroll">
      {categories.map((cat) => (
        <div
          className={`category-card ${selectedCategoryId === cat.id ? 'active' : ''}`}
          key={cat.id}
          onClick={() => onCategoryClick(cat.id)}
        >
          <img
            src={`https://fliplyn-api.onrender.com/${cat.image_url}`}
            alt={cat.name}
            className="category-img"
          />
          <p className="category-name">{cat.name}</p>
        </div>
      ))}
    </div>
  );
}

