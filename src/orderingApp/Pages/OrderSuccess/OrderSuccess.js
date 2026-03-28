import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./OrderSuccess.css";

const OrderSuccess = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const verifyOrder = async () => {

      try {

        const res = await axios.get(
          `https://admin-aged-field-2794.fly.dev/cashfree-orders/by-token/${token}`
        );

        const data = res.data;

        if (data.payment_status !== "SUCCESS") {

          alert("Payment not completed yet");
          navigate("/");

          return;
        }

        setOrder(data);

      } catch (err) {

        console.error(err);
        alert("Unable to fetch order");

      } finally {

        setLoading(false);

      }
    };

    if (token) verifyOrder();

  }, [token, navigate]);


  if (loading) {
    return <p style={{ textAlign: "center" }}>Checking payment...</p>;
  }

  if (!order) {
    return <p style={{ textAlign: "center" }}>Order not found</p>;
  }


  const formattedDate = new Date(order.created_datetime).toLocaleString();


  return (
    <div className="success-page">

      <div className="success-container">

        <div className="success-icon">✓</div>

        <h1 className="main-title">Payment Successful!</h1>
        <p className="sub-title">Your order has been placed</p>

        <div className="card token-card">

          <p className="label">Your Token Number</p>

          <h1 className="token-number">
            #{order.token_number.slice(-3)}
          </h1>

          <p className="date">{formattedDate}</p>

        </div>


        <div className="card items-card">

          <h3 className="items-title">Items Ordered</h3>

          {order.order_details.map((item, index) => (

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
          onClick={() => navigate("/")}
        >
          🏠 Back to Home
        </button>

      </div>

    </div>
  );
};

export default OrderSuccess;