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

  const buildingId = localStorage.getItem("selectedBuildingId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchWalletAndStalls = async () => {
      if (!buildingId) {
        navigate("/select-country");
        return;
      }

      try {
        let userWallet = null;

        // Step 1: Fetch wallet
        if (userId) {
          try {
            const walletRes = await axios.get(
              `https://admin-aged-field-2794.fly.dev/wallets/${userId}`
            );
            userWallet = walletRes.data;
            setWallet(userWallet);

          } catch (err) {
            console.warn("⚠️ No wallet found for this user, showing all stalls.");
          }
        }

        // Step 2: Fetch stalls for building
        const stallsRes = await axios.get(
          `https://admin-aged-field-2794.fly.dev/stalls/building/${buildingId}`
        );
        let fetchedStalls = stallsRes.data || [];


        // Step 3: Separate PREPAID and POSTPAID stalls
        const prepaidStalls = fetchedStalls.filter(
          (stall) => stall.payment_type.toUpperCase() === "PREPAID"
        );
        const postpaidStalls = fetchedStalls.filter(
          (stall) => stall.payment_type.toUpperCase() === "POSTPAID"
        );


        // Step 4: Filter stalls based on wallet type
        if (userWallet?.payment_method.toUpperCase() === "PREPAID") {
          fetchedStalls = prepaidStalls;
        } else if (userWallet?.payment_method.toUpperCase() === "POSTPAID") {
          fetchedStalls = postpaidStalls;
        } else {
          // fallback: show all
          fetchedStalls = [...prepaidStalls, ...postpaidStalls];
        }

        setStalls(fetchedStalls);
      } catch (error) {
        console.error("❌ Failed to fetch stalls or wallet:", error);
        localStorage.removeItem("selectedBuildingId");
        navigate("/select-country");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAndStalls();
  }, [buildingId, navigate, userId]);

  const handleStallClick = (stallId) => {
    navigate(`/categories/${stallId}`);
  };

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
      <div className="stall-wrapper">
        <div className="stall-content">
          <div className="stall-head-wrapper">
            <h2 className="stall-headings">Explore Outlets</h2>
            <p className="stall-subtext">
              Browse menus and order your favorite meals.
            </p>
          </div>

          {stalls.length === 0 ? (
            <p className="stall-empty">No stalls available in this building.</p>
          ) : (
            <div className="stall-grid">
              {stalls.map((stall) => (
                <div
                  className="stall-card-wrapper"
                  key={stall.id}
                  onClick={() => handleStallClick(stall.id)}
                >
                  <div className="stall-card">
                    <div className="image-container">
                      <img
                        src={stall.image_url}
                        alt={stall.name}
                        className="stall-image"
                      />
                      <div className="view-menu-layout">View Menu</div>
                    </div>
                    {/* Show payment type visually */}
                    <div
                      className={`stall-payment-tag ${
                        stall.payment_type.toUpperCase() === "PREPAID"
                          ? "prepaid"
                          : "postpaid"
                      }`}
                    >
                      {stall.payment_type.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
