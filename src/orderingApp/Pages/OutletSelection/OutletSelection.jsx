import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

import useCartStore from "../store/cartStore";

import "./OutletSelection.css";

const OutletSelection = () => {
  const navigate = useNavigate();

  const orderInfo = useCartStore((s) => s.orderInfo);
  const setOrderInfo = useCartStore((s) => s.setOrderInfo);

  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Hardcoded building ID
  const BUILDING_ID = "aedf4b77-abad-417a-af9b-b789dbf4d772";

  // ✅ Fetch outlets
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await axios.get(
          `https://admin-aged-field-2794.fly.dev/stalls/building/${BUILDING_ID}`
        );

        // ✅ Optional: show only available outlets 
        const availableOutlets = res.data.filter(
          (outlet) => outlet.is_available
        );

        setOutlets(availableOutlets);
      } catch (error) {
        console.error("Error fetching outlets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, []);

  const handleSelect = (outlet) => {
    if (orderInfo) {
      setOrderInfo({
        ...orderInfo,
        outletId: outlet.id,
        outletName: outlet.name,
      });
    }

    navigate(`/categories/ordering/${outlet.id}`)
  };

  return (
    <div className="outlet-page">
      <div className="outlet-container">
        <button
          className="back-btn"
          onClick={() => navigate("/customer-details")}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="page-title">Select Outlet</h1>
        <p className="page-subtitle">
          Choose where to order from
        </p>

        {/* ✅ Loading */}
        {loading ? (
          <p>Loading outlets...</p>
        ) : (
          <div className="outlet-list">
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                className="outlet-card"
                onClick={() => handleSelect(outlet)}
              >
                {/* Image */}
                <img
                  src={
                    outlet.image_url ||
                    "https://via.placeholder.com/150"
                  }
                  alt={outlet.name}
                  className="outlet-image"
                />

                <div className="outlet-info">
                  <h3>{outlet.name}</h3>
                  <p>{outlet.description}</p>

                  {/* ✅ Extra UX */}
                  <small>
                    {outlet.opening_time} - {outlet.closing_time}
                  </small>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ✅ No outlets case */}
        {!loading && outlets.length === 0 && (
          <p>No outlets available</p>
        )}
      </div>
    </div>
  );
};

export default OutletSelection;