import { useEffect, useState } from "react";
import Header from "../Header/Header";
import { useAuth } from "../../AuthContext/ContextApi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const S3_BASE_URL = "https://fliplyn-assets.s3.ap-south-1.amazonaws.com/";

export default function Cart() {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(stored);
  }, []);

  // Update quantity
  const updateQuantity = (itemId, newQty) => {
    let updated = [...cartItems];

    if (newQty <= 0) {
      updated = updated.filter((item) => item.id !== itemId);
    } else {
      updated = updated.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      );
    }

    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
  };

  // Send to backend
  const handleProceed = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);

    try {
      const payload = {
        user_id: user.id,
        items: cartItems.map((i) => ({
          item_id: i.id,
          quantity: i.quantity,
          Gst_precentage: i.Gst_precentage || 0,
        })),
      };

      await axios.post(`${API_BASE_URL}/cart/add-multiple`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/wallet");
    } catch (err) {
      console.error("❌ Cart creation failed:", err);
      setError("Failed to create cart. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalGST = cartItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity * ((item.Gst_precentage || 0) / 100),
    0
  );

  const total = subtotal + totalGST;
  const finalTotal = Math.round(total);

  // Loader screen
  if (loading) {
    return (
      <>
        <Header />
        <div className="cart-loader-container">
          <div className="cart-loader"></div>
          <p>Processing payment...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
          <div className="cart-page">

      <h2 className="heading">Your Basket</h2>

      {error && <div className="cart-error">{error}</div>}

      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          Your cart is empty.
        </div>
      ) : (
        <>
          <div className="cart-wrapper">
            <div className="cart-grid">
              {cartItems.map((item) => {
                const imageUrl = item.image_url?.startsWith("http")
                  ? item.image_url
                  : `${S3_BASE_URL}${item.image_url}`;

                // const itemGST =
                //   (item.price *
                //     item.quantity *
                //     (item.Gst_precentage || 0)) /
                //   100;

                return (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-row">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="item-image"
                        onError={(e) => (e.target.src = "/fallback-item.jpg")}
                      />

                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-subtext">{item.description || "With fries"}</p>
                      </div>

                      <div className="price-and-qty">
                        <p className="price-text">₹{item.price}</p>

                        <div className="quantity-box">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button className="add-more-btn" onClick={() => navigate(-1)}>
              ADD MORE ITEMS
            </button>
            </div>
          </div>

          {/* Summary section */}
          <div className="cart-summary">
            <p>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </p>

            <p>
              <span>GST/Taxes</span>
              <span>₹{totalGST.toFixed(0)}</span>
            </p>

            <hr />

            <h3>
              <span>Total</span>
              <span>₹{finalTotal.toFixed(0)}</span>
            </h3>
          </div>

          {/* Bottom Buttons */}
          <div className="sticky-bottom">
            

            <button className="payment-btn" onClick={handleProceed}>
              Select Payment
            </button>
          </div>
        </>
      )}
      </div>
    </>
  );
}
