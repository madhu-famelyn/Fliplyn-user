import React from "react";
import "./OfflinePopup.css";

export default function OfflinePopup({ isOffline }) {
  if (!isOffline) return null;

  return (
    <div className="offline-overlay">
      <div className="offline-popup">
        <h2>No Internet Connection</h2>
        <p>
          Please check your network connection and try again.
        </p>
      </div>
    </div>
  );
}
