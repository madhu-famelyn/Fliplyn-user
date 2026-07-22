import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Stalls.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/ContextApi";

// Skeleton loader card
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-text" />
    </div>
  );
}

export default function Stall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const currentBuildingId = user?.building_id || localStorage.getItem("selectedBuildingId");
  const [buildingId, setBuildingId] = useState(currentBuildingId);

  // 🚀 INSTANT LOAD: Read cached stalls if available (< 50ms load time)
  const [stalls, setStalls] = useState(() => {
    if (!currentBuildingId) return [];
    try {
      const cached = localStorage.getItem(`cached_stalls_${currentBuildingId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => stalls.length === 0);
  const [, setWallet] = useState(null);
  const [search, setSearch] = useState("");

  // Keep buildingId synced
  useEffect(() => {
    if (user?.building_id) {
      localStorage.setItem("selectedBuildingId", user.building_id);
      if (user.building_id !== buildingId) {
        setBuildingId(user.building_id);
      }
    }
  }, [user, buildingId]);

  useEffect(() => {
    const fetchWalletAndStalls = async () => {
      // Read from localStorage directly to avoid stale closure over buildingId state
      let finalBuildingId = localStorage.getItem("selectedBuildingId") || "";

      // Always re-fetch building_id from user profile to get fresh value
      if (userId) {
        try {
          const userRes = await axios.get(
            `https://admin-aged-field-2794.fly.dev/user/${userId}`
          );
          const freshBuildingId = userRes.data?.building_id;
          if (freshBuildingId) {
            finalBuildingId = freshBuildingId;
            localStorage.setItem("selectedBuildingId", freshBuildingId);
            setBuildingId(freshBuildingId);
          }
        } catch (err) {
          console.error("❌ Error fetching user building:", err);
        }
      }

      if (!finalBuildingId) {
        setLoading(false);
        return;
      }

      // 🚀 PARALLEL FETCH: Load Stalls and Wallet simultaneously
      try {
        const stallsPromise = axios.get(
          `https://admin-aged-field-2794.fly.dev/stalls/building/${finalBuildingId}`
        );
        const walletPromise = userId
          ? axios
              .get(`https://admin-aged-field-2794.fly.dev/wallets/${userId}`)
              .catch(() => ({ data: null }))
          : Promise.resolve({ data: null });

        const [stallsRes, walletRes] = await Promise.all([
          stallsPromise,
          walletPromise,
        ]);

        const fetchedStalls = stallsRes.data || [];
        setStalls(fetchedStalls);
        if (walletRes?.data) setWallet(walletRes.data);

        // Save to cache for instant rendering next time
        localStorage.setItem(
          `cached_stalls_${finalBuildingId}`,
          JSON.stringify(fetchedStalls)
        );
      } catch (err) {
        console.error("❌ Stall fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAndStalls();
  }, [userId]);

  // ------------------ CLICK HANDLER ------------------
  const handleStallClick = (stallId) => {
    navigate(`/categories/${stallId}`);
  };

  // ------------------ SEARCH FILTER & ACTIVE SORT ------------------
  const filteredStalls = stalls
    .filter(
      (stall) =>
        stall.name?.toLowerCase().includes(search.toLowerCase()) &&
        stall.is_available
    );

  return (
    <>
      <Header />

      <div className="stalls-page-container">
        {/* Hero Header */}
        <div className="top-section">
          <div className="hero-badge">
            <span></span>
            {loading ? "Fetching outlets" : `${filteredStalls.length} Outlets`}
          </div>

          <h1 className="page-title">Explore Outlets</h1>
          <p className="page-subtitle">
            Browse menus and order your favorite meals.
          </p>

          <div className="search-bar-container">
            <input
              id="stall-search"
              type="text"
              placeholder="Search stalls..."
              className="search-bar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="bottom-section">
            <div className="stalls-skeleton-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : filteredStalls.length === 0 ? (
          <p className="no-stalls">
            {search
              ? "No stalls match your search."
              : "No stalls available in this building."}
          </p>
        ) : (
          <div className="bottom-section">
            <div className="stalls-grid">
              {filteredStalls.map((stall) => (
                <div
                  className={`stall-card ${!stall.is_available ? "unavailable" : ""}`}
                  key={stall.id}
                  onClick={() => stall.is_available && handleStallClick(stall.id)}
                >
                  {/* Image wrapper with shine + open badge */}
                  <div className="stall-image-wrapper">
                    <img
                      src={stall.image_url}
                      alt={stall.name}
                      className="stall-image"
                      loading="lazy"
                    />

                    {!stall.is_available && (
                      <div className="unavailable-overlay">
                        <p>Closed</p>
                      </div>
                    )}
                  </div>

                  <p className="stall-names">{stall.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}