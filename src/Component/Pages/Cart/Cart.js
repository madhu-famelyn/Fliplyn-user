import { useEffect, useState } from "react";
import Header from "../Header/Header";
import { useAuth } from "../../AuthContext/ContextApi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import "./Cart.css";

const API_BASE_URL = "https://admin-aged-field-2794.fly.dev";
const S3_BASE_URL = "https://fliplyn-assets.s3.ap-south-1.amazonaws.com/";

export default function Cart() {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Load from localStorage and backfill stall_name if missing
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cartItems")) || [];

    // Backfill stall_name for old cart items that were saved without it
    if (stored.length > 0 && !stored[0].stall_name) {
      // Search all cached stall lists in localStorage
      const stallId = stored[0].stall_id;
      let foundStallName = "";
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("cached_stalls_")) {
          try {
            const stalls = JSON.parse(localStorage.getItem(key)) || [];
            const match = stalls.find((s) => s.id === stallId);
            if (match) {
              foundStallName = match.name || "";
              break;
            }
          } catch {}
        }
      }
      if (foundStallName) {
        const enriched = stored.map((item) => ({ ...item, stall_name: foundStallName }));
        localStorage.setItem("cartItems", JSON.stringify(enriched));
        setCartItems(enriched);
        return;
      }
    }

    console.log("🛒 Loaded cart items from localStorage:", stored);
    setCartItems(stored);
  }, []);

  // Update quantity and log the updates
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
    window.dispatchEvent(new Event("cart-updated"));  // ← keeps cart count in sync

    console.log("🔄 Updated cartItems:", updated);
    console.log("💾 Updated localStorage.cartItems:", JSON.parse(localStorage.getItem("cartItems")));
  };


  // Send to backend + log (Instant Navigation)
  const handleProceed = () => {
    if (cartItems.length === 0) return;

    // 🚀 INSTANT (< 10ms) transition to Payment page
    navigate("/wallet");

    // Non-blocking background sync
    if (user?.id && token) {
      const payload = {
        user_id: user.id,
        items: cartItems.map((i) => ({
          item_id: i.id,
          quantity: i.quantity,
          Gst_precentage: i.Gst_precentage || 0,
        })),
      };

      axios.post(`${API_BASE_URL}/cart/add-multiple`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => {
        console.warn("⚠️ Background cart sync note:", err);
      });
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalGST = cartItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity * ((item.Gst_precentage || item.gst_percentage || 0) / 100),
    0
  );

  const total = subtotal + totalGST;
  const isKammani = cartItems.length > 0 &&
    cartItems[0].stall_name?.toLowerCase().includes("kammani");
  const kammaniDiscount = isKammani && subtotal >= 399 ? 100 : 0;
  const finalTotal = total - kammaniDiscount;
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;

  return (
    <>
      <Header />
      <div className="cart-page">
        <h2 className="heading">Your Basket</h2>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-emoji">🛒</div>
            <h3>Your basket is empty</h3>
            <p>Add items from a stall to get started</p>
          </div>
        ) : (
          <>
            <div className="cart-wrapper">
              <div className="cart-grid">
                {cartItems.map((item) => {
                  const imageUrl = item.image_url?.startsWith("http")
                    ? item.image_url
                    : `${S3_BASE_URL}${item.image_url}`;

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

            {/* Kammani promo banner */}
            {isKammani && subtotal < 399 && (
              <div className="kammani-promo-banner">
                🎉 Add ₹{(399 - subtotal).toFixed(2)} more to get ₹100 off!
              </div>
            )}
            {isKammani && kammaniDiscount > 0 && (
              <div className="kammani-promo-banner applied">
                🎉 ₹100 Kammani discount applied!
              </div>
            )}

            {/* Summary section */}
            <div className="cart-summary">
              <p>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </p>
              {kammaniDiscount > 0 && (
                <p className="discount-row">
                  <span>🎉 Discount (Kammani)</span>
                  <span>- ₹{kammaniDiscount.toFixed(2)}</span>
                </p>
              )}
              {kammaniDiscount > 0 && (
                <p className="net-amount-row">
                  <span>Net Amount</span>
                  <span>₹{(subtotal - kammaniDiscount).toFixed(2)}</span>
                </p>
              )}
              <p>
                <span>CGST</span>
                <span>₹{cgst.toFixed(2)}</span>
              </p>
              <p>
                <span>SGST</span>
                <span>₹{sgst.toFixed(2)}</span>
              </p>
              <p>
                <span>GST Total</span>
                <span>₹{totalGST.toFixed(2)}</span>
              </p>

              <hr />

              <h3>
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
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
      <Footer />
    </>
  );
}
