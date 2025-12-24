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

  const [categories, setCategories] = useState([]);
  const [, setStallDetails] = useState(null);
  const [, setItemCount] = useState(0);

  // 🔹 Default = ALL ITEMS
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");

  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [, setAllItems] = useState([]);

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

  // ================= LOAD CATEGORIES + STALL + ALL ITEMS =================
  useEffect(() => {
    if (!stallId) return;

    axios
      .get(`${BASE_URL}/categories/stall/${stallId}`)
      .then((res) => {
        const updatedCategories = [
          {
            id: "ALL",
            name: "All Items",
            icon: <FiGrid size={18} color="#f97316" />, // orange
          },
          ...res.data,
        ];

        setCategories(updatedCategories);
      })
      .catch((err) => console.error("❌ Error fetching categories:", err));

    axios
      .get(`${BASE_URL}/stalls/${stallId}`)
      .then((res) => setStallDetails(res.data))
      .catch((err) => console.error("❌ Error fetching stall:", err));

    // 🔹 Load all items initially
    axios
      .get(`${BASE_URL}/items/stall/${stallId}`)
      .then((res) => {
        setAllItems(res.data);
        setItems(res.data);
        setItemCount(res.data.length);
        setItemsLoaded(true);
      })
      .catch((err) => {
        console.error("❌ Error fetching all items:", err);
        setItems([]);
        setItemsLoaded(true);
      });
  }, [stallId]);

  // ================= LOAD ITEMS BASED ON CATEGORY =================
  useEffect(() => {
    if (!stallId || !selectedCategoryId) return;

    setItems([]);
    setItemsLoaded(false);

    // 🔹 ALL ITEMS
    if (selectedCategoryId === "ALL") {
      axios
        .get(`${BASE_URL}/items/stall/${stallId}`)
        .then((res) => {
          setItems(res.data);
          setItemsLoaded(true);
        })
        .catch(() => {
          setItems([]);
          setItemsLoaded(true);
        });
      return;
    }

    // 🔹 CATEGORY ITEMS
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
  }, [selectedCategoryId, stallId]);

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
          {/* Header with Cart */}
          <div className="menu-header">
            <h2 className="menu-title">Menu</h2>

            <button
              className={`view-cart-btn ${cartCount > 0 ? "has-items" : ""}`}
              onClick={() => navigate("/cart")}
            >
              <FiShoppingCart color="#fff" size={16} />
              Cart
            </button>
          </div>

          {/* Item List */}
          <ItemList items={items} itemsLoaded={itemsLoaded} />
        </div>
      </div>
      <Footer/>
    </div>
  );
}
