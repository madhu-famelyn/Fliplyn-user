import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Stalls.css";
import Header from "../Header/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/ContextApi";

export default function Stall() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setWallet] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [buildingId, setBuildingId] = useState(
    localStorage.getItem("selectedBuildingId")
  );

  useEffect(() => {
    const fetchWalletAndStalls = async () => {
      if (!userId) {
        console.warn("⚠️ User not available yet");
        return;
      }

      try {
        let finalBuildingId = buildingId;

        // ------------------ STEP 1: GET BUILDING ID ------------------
        if (!finalBuildingId) {
          console.log("🔍 Fetching buildingId using userId...");

          const userRes = await axios.get(
            `https://admin-aged-field-2794.fly.dev/user/${userId}`
          );

          finalBuildingId = userRes.data?.building_id;

          if (finalBuildingId) {
            localStorage.setItem("selectedBuildingId", finalBuildingId);
            setBuildingId(finalBuildingId);
          }
        }

        if (!finalBuildingId) {
          console.warn("⚠️ No buildingId found, continuing without redirect");
          setLoading(false);
          return;
        }

        let userWallet = null;

        // ------------------ FETCH WALLET ------------------
        try {
          const walletRes = await axios.get(
            `https://admin-aged-field-2794.fly.dev/wallets/${userId}`
          );
          userWallet = walletRes.data;
          setWallet(walletRes.data);
        } catch {
          console.warn("⚠️ Wallet not found → showing all stalls");
        }

        // ------------------ FETCH STALLS ------------------
        console.log("🔄 Fetching fresh stalls from API...");

        const res = await axios.get(
          `https://admin-aged-field-2794.fly.dev/stalls/building/${finalBuildingId}`
        );

        let fetched = res.data || [];

        // ------------------ FILTER BASED ON PAYMENT TYPE ------------------
        const prepaid = fetched.filter(
          (s) => s.payment_type?.toUpperCase() === "PREPAID"
        );
        const postpaid = fetched.filter(
          (s) => s.payment_type?.toUpperCase() === "POSTPAID"
        );

        if (userWallet?.payment_method?.toUpperCase() === "PREPAID") {
          fetched = prepaid;
        } else if (userWallet?.payment_method?.toUpperCase() === "POSTPAID") {
          fetched = postpaid;
        } else {
          fetched = [...prepaid, ...postpaid];
        }

        setStalls(fetched);
      } catch (err) {
        console.error("❌ Stall fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAndStalls();
  }, [buildingId, userId]);

  // ------------------ CLICK HANDLER ------------------
  const handleStallClick = (stallId) => {
    navigate(`/categories/${stallId}`);
  };

  // ------------------ SEARCH FILTER ------------------
  const filteredStalls = stalls.filter((stall) =>
    stall.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ------------------ LOADING ------------------
  if (loading) {
    return (
      <>
        <Header />
        <div className="stall-wrapper">
          <p className="stall-empty">Loading stalls...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="stalls-page-container">
        <button className="back-btn" onClick={() => navigate(-1)}></button>

        <div className="top-section">
          <h1 className="page-title">Explore Outlets</h1>
          <p className="page-subtitle">
            Browse menus and order your favorite meals.
          </p>

          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search Stalls"
              className="search-bar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredStalls.length === 0 ? (
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
      <img
        src={stall.image_url}
        alt={stall.name}
        className="stall-image"
      />

      {!stall.is_available && (
        <div className="unavailable-overlay">
          <p>Stall Unavailable</p>
        </div>
      )}

      <p className="stall-names">{stall.name}</p>
    </div>
  ))}
</div>

          </div>
        )}
      </div>
    </>
  );
}
