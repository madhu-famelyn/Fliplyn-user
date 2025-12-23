import React, { useEffect, useState } from "react";
import "./LoadingScreen.css";

import logo from "../../assets/Images/Logo.png";
import img1 from "../../assets/Images/image1.png";
import img2 from "../../assets/Images/image2.png";
import img3 from "../../assets/Images/image3.png";
import img4 from "../../assets/Images/image4.png";
import img5 from "../../assets/Images/image5.png";
import img6 from "../../assets/Images/image6.png";

export default function LoadingScreen({ onFinish }) {
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    // Show final images AFTER existing animation completes
    const showTimer = setTimeout(() => {
      setShowFinal(true);
    }, 2000); // your existing animation duration

    // Finish after staying on black screen
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 4500); // black screen + 2s stay

    return () => {
      clearTimeout(showTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`loading-wrapper ${showFinal ? "final-phase" : ""}`}>
      {/* EXISTING DESIGN (UNCHANGED) */}
      <div className="logo-circle"></div>
      <img src={logo} alt="Fliplyn Logo" className="logo-animate" />

      {/* FINAL BLACK SCREEN CONTENT */}
      {showFinal && (
        <>
          <img src={logo} className="final-logo" alt="Final Logo" />

          <img src={img1} className="final-img img-1" alt="" />
          <img src={img2} className="final-img img-2" alt="" />
          <img src={img3} className="final-img img-3" alt="" />
          <img src={img4} className="final-img img-4" alt="" />
          <img src={img5} className="final-img img-5" alt="" />
          <img src={img6} className="final-img img-6" alt="" />
        </>
      )}
    </div>
  );
}
