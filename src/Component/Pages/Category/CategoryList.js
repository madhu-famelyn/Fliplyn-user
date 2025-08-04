// src/components/CategoryList.js
import React from 'react';
import './Category.css';

const S3_BASE_URL = 'https://fliplyn-assets.s3.ap-south-1.amazonaws.com/';

export default function CategoryList({ categories, selectedCategoryId, onCategoryClick }) {
  return (
    <div className="category-scroll">
      {categories.map((cat) => {
        const imageUrl = cat.image_url?.startsWith('http')
          ? cat.image_url
          : `${S3_BASE_URL}${cat.image_url}`;

        return (
          <div
            className={`category-card ${selectedCategoryId === cat.id ? 'active' : ''}`}
            key={cat.id}
            onClick={() => onCategoryClick(cat.id)}
          >
            <img
              src={imageUrl}
              alt={cat.name}
              className="category-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/fallback-category.jpg'; // fallback image if needed
              }}
            />
            <p className="category-name">{cat.name}</p>
          </div>
        );
      })}
    </div>
  );
}

