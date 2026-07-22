import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Category.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import CategoryList from "./CategoryList";
import ItemList from "../Items/ItemList";
import { FiShoppingCart, FiGrid } from "react-icons/fi";

const BASE_URL = "https://admin-aged-field-2794.fly.dev";

export default function Category() {
  const { stallId } = useParams();
  const navigate = useNavigate();

  // 🚀 INSTANT CACHE LOAD: Categories & Items
  const [categories, setCategories] = useState(() => {
    if (!stallId) return [];
    try {
      const cached = localStorage.getItem(`cached_categories_${stallId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [allItems, setAllItems] = useState(() => {
    if (!stallId) return [];
    try {
      const cached = localStorage.getItem(`cached_items_${stallId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [items, setItems] = useState(allItems);
  const [itemsLoaded, setItemsLoaded] = useState(() => allItems.length > 0);
  const [, setStallDetails] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // ================= CART COUNT =================
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

  // ================= 🚀 PARALLEL FETCH & BACKGROUND REVALIDATE =================
  useEffect(() => {
    if (!stallId) return;

    const fetchCategoryAndItems = async () => {
      try {
        const catPromise = axios.get(`${BASE_URL}/categories/stall/${stallId}`);
        const stallPromise = axios.get(`${BASE_URL}/stalls/${stallId}`);
        const itemsPromise = axios.get(`${BASE_URL}/items/stall/${stallId}`);

        const [catRes, stallRes, itemsRes] = await Promise.all([
          catPromise,
          stallPromise,
          itemsPromise
        ]);

        const updatedCategories = [
          {
            id: "ALL",
            name: "All Items",
            icon: <FiGrid size={18} color="#f97316" />,
          },
          ...(catRes.data || []),
        ];

        setCategories(updatedCategories);
        setStallDetails(stallRes.data);

        const fetchedItems = itemsRes.data || [];
        setAllItems(fetchedItems);
        setItemsLoaded(true);

        // Cache for sub-second rendering
        localStorage.setItem(`cached_categories_${stallId}`, JSON.stringify(updatedCategories));
        localStorage.setItem(`cached_items_${stallId}`, JSON.stringify(fetchedItems));
      } catch (err) {
        console.error("❌ Error fetching stall menu:", err);
        setItemsLoaded(true);
      }
    };

    fetchCategoryAndItems();
  }, [stallId]);

  // ================= 🚀 INSTANT IN-MEMORY CATEGORY FILTERING =================
  useEffect(() => {
    if (selectedCategoryId === "ALL") {
      setItems(allItems);
    } else {
      const filtered = allItems.filter(
        (item) => String(item.category_id) === String(selectedCategoryId)
      );
      setItems(filtered.length > 0 ? filtered : allItems);
    }
  }, [selectedCategoryId, allItems]);

  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id);
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
          {/* Header */}
          <div className="menu-header">
            <h2 className="menu-title">Menu</h2>
          </div>

          {/* Item List */}
          <ItemList items={items} itemsLoaded={itemsLoaded} />
        </div>
      </div>

      {/* 🚀 FLOATING CART BUTTON (PINNED TO BOTTOM RIGHT) */}
      <button
        className={`floating-cart-btn ${cartCount > 0 ? "has-items" : ""}`}
        onClick={() => navigate("/cart")}
      >
        <FiShoppingCart color="#fff" size={20} />
        <span>Cart{cartCount > 0 ? ` (${cartCount})` : ""}</span>
      </button>

      <Footer/>
    </div>
  );
}
