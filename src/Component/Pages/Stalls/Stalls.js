import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Stalls.css";
import Header from "../Header/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/ContextApi";

export default function Stall() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);

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

        // ✅ Step 1: Try to get wallet by user ID
        if (userId) {
          try {
            const walletRes = await axios.get(
              `https://admin-aged-field-2794.fly.dev/wallets/${userId}`
            );
            userWallet = walletRes.data;
            setWallet(userWallet);

            // ✅ Log wallet payment type
            console.log("💰 User Wallet:", userWallet);
            console.log("🟢 Wallet Payment Method:", userWallet.payment_method);
          } catch (err) {
            console.warn("⚠️ No wallet found for this user, showing all stalls.");
          }
        }

        // ✅ Step 2: Fetch stalls by building ID
        const stallsRes = await axios.get(
          `https://admin-aged-field-2794.fly.dev/stalls/building/${buildingId}`
        );

        let fetchedStalls = stallsRes.data || [];

        // ✅ Log all stalls
        console.log("🏪 All fetched stalls:", fetchedStalls);

        // ✅ Separate prepaid and postpaid stalls for clarity
        const prepaidStalls = fetchedStalls.filter(
          (stall) => stall.payment_type === "PREPAID"
        );
        const postpaidStalls = fetchedStalls.filter(
          (stall) => stall.payment_type === "POSTPAID"
        );

        console.log("🟢 PREPAID Stalls:", prepaidStalls);
        console.log("🟠 POSTPAID Stalls:", postpaidStalls);

        // ✅ Step 3: Filter based on wallet type
        if (userWallet && userWallet.payment_method === "POSTPAID") {
          fetchedStalls = fetchedStalls.filter(
            (stall) => stall.payment_type === "POSTPAID"
          );
        }

        // ✅ Step 4: If still empty, clear and redirect
        if (!fetchedStalls || fetchedStalls.length === 0) {
          localStorage.removeItem("selectedBuildingId");
          navigate("/select-country");
          return;
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
                    {/* ✅ Show payment type visually */}
                    <div className="stall-payment-tag">{stall.payment_type}</div>
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
