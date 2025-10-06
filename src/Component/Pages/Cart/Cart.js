// src/pages/Cart.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Header from "../Header/Header";
import { useAuth } from "../../AuthContext/ContextApi";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const API_BASE_URL = "https://admin-aged-field-2794.fly.dev";
const S3_BASE_URL = "https://fliplyn-assets.s3.ap-south-1.amazonaws.com/";

export default function Cart() {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(null);
  const [itemDetails, setItemDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // fetch item details
  const fetchItemDetails = useCallback(async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return {};
    try {
      console.log("📦 Fetching item details for:", cartItems);
      const requests = cartItems.map((item) =>
        axios.get(`${API_BASE_URL}/items/items/${item.item_id}`)
      );
      const responses = await Promise.all(requests);
      const itemMap = {};
      responses.forEach((res) => {
        const item = res.data;
        itemMap[item.id] = item;
      });
      console.log("✅ Item details fetched:", itemMap);
      return itemMap;
    } catch (err) {
      console.error("❌ Error fetching item details:", err.response?.data || err.message);
      return {};
    }
  }, []);

  // fetch cart
  const fetchCart = useCallback(async () => {
    if (!user) {
      console.warn("⚠️ No user found, skipping fetchCart");
      return;
    }
    console.log(`🛒 Fetching cart for user: ${user.id}`);
    try {
      const res = await axios.get(`${API_BASE_URL}/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Cart fetched:", res.data);
      const fetchedCart = res.data;
      const itemMap = await fetchItemDetails(fetchedCart.items);
      setCart(fetchedCart);
      setItemDetails(itemMap);
    } catch (err) {
      console.error("❌ Error fetching cart:", err.response?.data || err.message);
      setError("No items in cart");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user, token, fetchItemDetails]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // update quantity
  const updateQuantity = async (item_id, quantity) => {
    if (quantity < 0) return;

    console.log("🔄 Updating quantity:", {
      user_id: user?.id,
      item_id,
      quantity,
    });

    try {
      if (quantity === 0 && cart.items.length === 1) {
        console.log("🗑 Clearing entire cart for user:", user.id);
        await axios.delete(`${API_BASE_URL}/cart/clear/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Cart cleared");
        setCart(null); // clear local state
        return;
      }

      // Otherwise, just update quantity
      const res = await axios.put(
        `${API_BASE_URL}/cart/update-quantity`,
        {
          user_id: user.id,
          item_id,
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Quantity updated:", res.data);
      fetchCart();
    } catch (err) {
      console.error("❌ Failed to update quantity:", err.response?.data || err.message);
      setError("Failed to update quantity");
    }
  };

  return (
    <>
      <Header />
      <h2 className="heading">Your Cart</h2>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          Loading cart...
        </div>
      ) : error || !cart || cart.items.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          Your cart is empty.
        </div>
      ) : (
        <div className="cart-wrapper">
          <div className="cart-grid">
            {cart.items.map((item) => {
              const itemData = itemDetails[item.item_id];
              const itemTotal = item.quantity * item.price_at_addition;

              const imageUrl = itemData?.image_url?.startsWith("http")
                ? itemData.image_url
                : `${S3_BASE_URL}${itemData?.image_url}`;

              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-row">
                    <img
                      src={imageUrl}
                      alt={itemData?.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/fallback-item.jpg"; // fallback if image fails
                      }}
                    />
                    <div className="item-info">
                      <p className="item-name">{itemData?.name}</p>
                      <p className="item-price">₹ {item.price_at_addition}</p>
                    </div>
                    <div className="quantity-box">
                      <button
                        onClick={() =>
                          updateQuantity(item.item_id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.item_id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="item-total">
                      ₹{" "}
                      {Number.isInteger(itemTotal)
                        ? itemTotal
                        : itemTotal.toFixed(2)}
                    </p>
                  </div>

                  <button
                    className="remove-button"
                    onClick={() => updateQuantity(item.item_id, 0)}
                    title="Remove item"
                  >
                    Remove from Cart
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="summary-line">
              <span>{cart.items.length} items</span>
              <span>
                Total: ₹{" "}
                {cart.items
                  .reduce(
                    (total, item) =>
                      total + item.quantity * item.price_at_addition,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
          </div>

          <div className="cart-actions">
            <button className="cancel-button" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              className="proceed-button"
              onClick={() => navigate("/wallet")}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
