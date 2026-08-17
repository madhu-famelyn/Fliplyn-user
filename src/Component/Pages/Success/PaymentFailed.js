import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          maxWidth: "380px",
          width: "90%",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>❌</div>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#0f172a",
            margin: "0 0 8px",
          }}
        >
          Payment Failed
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            marginBottom: "28px",
            lineHeight: "1.6",
          }}
        >
          Your payment could not be completed. No amount has been deducted. Please
          try again.
        </p>
        <button
          onClick={() => navigate("/cart")}
          style={{
            display: "block",
            width: "100%",
            padding: "14px",
            background: "#eb4d26",
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => navigate("/stalls")}
          style={{
            display: "block",
            width: "100%",
            padding: "14px",
            background: "#f1f5f9",
            color: "#475569",
            border: "none",
            borderRadius: "14px",
            fontWeight: "600",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Back to Stalls
        </button>
      </div>
    </div>
  );
}
