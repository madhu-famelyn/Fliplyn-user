import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./OrderSuccess.css";

const OrderSuccess = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlToken = searchParams.get("token");
  const storedToken = sessionStorage.getItem("current_token");

  console.log("URL token:", urlToken);
  console.log("Session token:", storedToken);

  const token = urlToken || storedToken;

  console.log("Final token used:", token);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    console.log("OrderSuccess useEffect triggered");

    if (!token) {

      console.log("No token found. Stopping verification.");

      setLoading(false);
      return;

    }

    let retryCount = 0;
    const maxRetries = 10;

    const verifyOrder = async () => {

      console.log("Verifying order... Attempt:", retryCount + 1);

      try {

        const url = `https://admin-aged-field-2794.fly.dev/cashfree-orders/by-token/${token}`;

        console.log("Calling API:", url);

        const res = await axios.get(url);

        console.log("API response:", res);

        const data = res.data;

        console.log("Order data:", data);

        if (data) {

          setOrder(data);

          console.log("Payment status:", data.payment_status);

          if (data.payment_status === "SUCCESS") {

            console.log("Payment SUCCESS. Stopping polling.");

            setLoading(false);
            return;

          }

        }

        if (retryCount < maxRetries) {

          retryCount++;

          console.log("Retrying in 2 seconds... Retry:", retryCount);

          setTimeout(verifyOrder, 2000);

        } else {

          console.log("Max retries reached. Stopping.");

          setLoading(false);

        }

      } catch (err) {

        console.error("Order verification failed:", err);

        setLoading(false);

      }

    };

    verifyOrder();

  }, [token]);


  if (loading) {

    console.log("Loading state active");

    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        🔄 Verifying Payment...
      </div>
    );

  }


  if (!order) {

    console.log("Order not found after verification");

    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        ❌ Order not found
      </div>
    );

  }

  const formattedDate = new Date(order.created_datetime).toLocaleString();

  console.log("Rendering order success page");

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
          onClick={() => {
            console.log("Back to home clicked");
            navigate("/orderingpage");
          }}
        >
          🏠 Back to Home
        </button>

      </div>

    </div>

  );

};

export default OrderSuccess;