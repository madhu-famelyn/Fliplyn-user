import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import FeedbackModal from "./FeedbackModal";
import { useNavigate } from "react-router-dom";

export default function FeedbackPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "80px", background: "#f8fafc" }}>
      <Header />
      <FeedbackModal isOpen={true} onClose={() => navigate("/stalls")} />
      <Footer />
    </div>
  );
}
