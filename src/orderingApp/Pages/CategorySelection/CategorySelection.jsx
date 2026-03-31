import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// import CartIndicator from "../../Components/CartIndicator";

import "./CategorySelection.css";

const CategorySelection = () => {
  const navigate = useNavigate();
  const { stallId } = useParams();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9",
  ];

  const allItemsImage =
    "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `https://admin-aged-field-2794.fly.dev/categories/stall/${stallId}`
        );
        setCategories(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    if (stallId) fetchCategories();
  }, [stallId]);

  return (
    <div className="category-page">
      <button className="back-btn" onClick={() => navigate("/outlets")}>
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="page-title">Categories</h1>
      <p className="page-subtitle">What are you in the mood for?</p>

      {loading && <p>Loading categories...</p>}
      {!loading && error && <p>{error}</p>}

      {!loading && !error && (
        <div className="category-grid">

          {/* 🔥 All Items */}
          <button
            className="category-card"
            onClick={() => navigate(`/items/all/${stallId}`)}
          >
            <img
              src={allItemsImage}
              className="category-image"
              alt="All menu items"
            />
            <span className="category-name">All Items</span>
          </button>

          {/* ✅ Categories */}
          {categories.map((c, index) => (
            <button
              key={c.id}
              className="category-card"
              onClick={() => navigate(`/items/${c.id}`)}
            >
              <img
                src={
                  c.image_url ||
                  fallbackImages[index % fallbackImages.length]
                }
                className="category-image"
                alt={c.name ? `${c.name} category` : "Food category"}
              />
              <span className="category-name">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && <p>No categories found</p>}

      {/* <CartIndicator /> */}
    </div>
  );
};

export default CategorySelection;