// src/pages/Stalls.js
import React, { useEffect } from "react";
import { useAuth } from "../AuthContex/ContextAPI";
import { useNavigate } from "react-router-dom";

export default function Stalls() {
  const { adminId, token } = useAuth();
  const navigate = useNavigate();

  // ✅ fallback to localStorage if context is not ready yet
  const effectiveAdminId = adminId || localStorage.getItem("adminId");
  const effectiveToken = token || localStorage.getItem("token");
  const buildingId = localStorage.getItem("buildingId"); // ✅ check this

  useEffect(() => {
    // 🚨 redirect if buildingId is missing
    if (!buildingId) {
      console.warn("⚠️ No buildingId found → redirecting to /select-country");
      navigate("/select-country");
      return;
    }

    if (!effectiveAdminId || !effectiveToken) {
      console.warn("⚠️ No adminId/token found", {
        adminId: effectiveAdminId,
        token: effectiveToken,
      });
      return;
    }

    console.log("✅ Stalls.js using values:", {
      adminId: effectiveAdminId,
      token: effectiveToken,
      buildingId,
    });

    // 👉 place your fetch call here using effectiveAdminId + effectiveToken
  }, [effectiveAdminId, effectiveToken, buildingId, navigate]);

  return <div>Stalls Page</div>;
}
