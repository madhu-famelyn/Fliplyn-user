import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./OrderSuccess.css";

const OrderSuccess = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlToken = searchParams.get("token");
  const storedToken = sessionStorage.getItem("current_token");

  const token = urlToken || storedToken;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!token) {
      setLoading(false);
      return;
    }

    let retryCount = 0;
    const maxRetries = 10;

    const verifyOrder = async () => {

      try {

        const res = await axios.get(
          `https://admin-aged-field-2794.fly.dev/cashfree-orders/by-token/${token}`
        );

        const data = res.data;

        if (data) {

          setOrder(data);

          if (data.payment_status === "SUCCESS") {
            setLoading(false);
            return;
          }

        }

        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(verifyOrder, 2000);
        } else {
          setLoading(false);
        }

      } catch (err) {

        console.error("Order verification failed", err);
        setLoading(false);

      }

    };

    verifyOrder();

  }, [token]);


  if (loading) {

    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        🔄 Verifying Payment...
      </div>
    );

  }


  if (!order) {

    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        ❌ Order not found
      </div>
    );

  }

  const formattedDate = new Date(order.created_datetime).toLocaleString();


  return (

    <div className="success-page">

      <div className="success-container">

        <div className="success-icon">✓</div>

        <h1 className="main-title">
          {order.payment_status === "SUCCESS"
            ? "Payment Successful!"
            : "Payment Processing"}
        </h1>

        <p className="sub-title">
          {order.payment_status === "SUCCESS"
            ? "Your order has been placed"
            : "We are confirming your payment"}
        </p>


        <div className="card token-card">

          <p className="label">Your Token Number</p>

          <h1 className="token-number">
            #{order.token_number?.slice(-3)}
          </h1>

          <p className="date">{formattedDate}</p>

        </div>


        <div className="card items-card">

          <h3 className="items-title">Items Ordered</h3>

          {order.order_details?.map((item, index) => (

            <div key={index} className="item-row">

              <span>
                {item.name} × {item.quantity}
              </span>

              <span>₹{item.total}</span>

            </div>

          ))}

          <hr />

          <div className="total-row">

            <span>Total</span>

            <span className="total-amount">
              ₹{order.total_amount}
            </span>

          </div>

        </div>


        <button
          className="home-btn"
          onClick={() => navigate("/orderingpage")}
        >
          🏠 Back to Home
        </button>

      </div>

    </div>

  );

};

export default OrderSuccess;