import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Category.css";
import Header from "../Header/Header";

import CategoryList from "./CategoryList";
import ItemList from "../Items/ItemList";
import { FiShoppingCart } from "react-icons/fi";

const BASE_URL = "http://127.0.0.1:8000";

export default function Category() {
  const { stallId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [, setStallDetails] = useState(null);
  const [, setItemCount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [, setAllItems] = useState([]);

  const [cartCount, setCartCount] = useState(0);

  // Load cart count from localStorage
  const loadLocalCartCount = () => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartCount(storedCart.length);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadLocalCartCount();
    window.addEventListener("storage", loadLocalCartCount);
    window.addEventListener("cart-updated", loadLocalCartCount);

    return () => {
      window.removeEventListener("storage", loadLocalCartCount);
      window.removeEventListener("cart-updated", loadLocalCartCount);
    };
  }, []);

  // Load categories + stall + all items
  useEffect(() => {
    if (!stallId) return;

    axios
      .get(`${BASE_URL}/categories/stall/${stallId}`)
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) setSelectedCategoryId(res.data[0].id);
      })
      .catch((err) => console.error("❌ Error fetching categories:", err));

    axios
      .get(`${BASE_URL}/stalls/${stallId}`)
      .then((res) => setStallDetails(res.data))
      .catch((err) => console.error("❌ Error fetching stall:", err));

    axios
      .get(`${BASE_URL}/items/stall/${stallId}`)
      .then((res) => {
        setAllItems(res.data);
        setItemCount(res.data.length);
      })
      .catch((err) => console.error("❌ Error fetching all items:", err));
  }, [stallId]);

  // Load items for selected category
  useEffect(() => {
    if (!selectedCategoryId) return;

    axios
      .get(
        `${BASE_URL}/items/items/category/${selectedCategoryId}/availability?is_available=true`
      )
      .then((res) => {
        setItems(res.data);
        setItemsLoaded(true);
      })
      .catch(() => {
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
        {/* LEFT: CATEGORY SIDEBAR */}
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryClick={handleCategoryClick}
        />

        {/* RIGHT: ITEMS AREA */}
        <div className="items-section">
          {/* Header with Cart */}
          <div className="menu-header">
            <h2 className="menu-title">Menu</h2>

            <button
              className={`view-cart-btn ${cartCount > 0 ? "has-items" : ""}`}
              onClick={() => navigate("/cart")}
            >
              <FiShoppingCart color="#fff" size={16} />
              {cartCount > 0 ? ` ${cartCount}` : " Cart is empty"}
            </button>
          </div>

          {/* Item List */}
          <ItemList items={items} itemsLoaded={itemsLoaded} />
        </div>
      </div>
    </div>
  );
}
