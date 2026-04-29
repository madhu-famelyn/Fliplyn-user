import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ClipboardList } from "lucide-react";
import "./LandingPage.css";
import Logo from "../../../assets/Images/Logo.png";
import Button from "../../Components/ui/Buttons/Buttons";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="logo-section">
        
        {/* Logo */}
        <img src={Logo} alt="Fliplyn Logo" className="logo-image" />

        <h1 className="app-title">Fliplyn</h1>

        <p className="subtitle">
          Fresh food, fast ordering. <br />
          Your next meal is just a tap away.
        </p>
      </div>

      <div className="button-group">
        <Button
          variant="hero"
          onClick={() => navigate("/customer-details")}
        >
          <ShoppingBag className="icon" />
          Create Order
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/get-orders")}
        >
          <ClipboardList className="icon" />
          Get My Orders
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;