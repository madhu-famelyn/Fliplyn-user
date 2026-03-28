import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail } from "lucide-react";

import Input from "../../Components/ui/Input/Input";
import Label from "../../Components/ui/Label/Label";
import Button from "../../Components/ui/Buttons/Buttons";

import "./CustomerDetails.css";

const CustomerDetails = () => {
  const navigate = useNavigate();

  // ✅ Load from localStorage initially
  const [name, setName] = useState(
    localStorage.getItem("customerName") || ""
  );
  const [email, setEmail] = useState(
    localStorage.getItem("customerEmail") || ""
  );

  // ✅ Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem("customerName", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("customerEmail", email);
  }, [email]);

  const handleContinue = () => {
    if (!name || !email) {
      alert("Please enter details");
      return;
    }

    // (Optional) Save again before navigating
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerEmail", email);

    navigate("/outlets");
  };

  return (
    <div className="details-page">
      <button
        className="back-btn"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="page-title">Your Details</h1>
      <p className="page-subtitle">Tell us a bit about you</p>

      <div className="form-container">
        <div className="form-group">
          <Label>Name</Label>
          <Input
            icon={User}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <Label>Email</Label>
          <Input
            icon={Mail}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button variant="hero" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetails;