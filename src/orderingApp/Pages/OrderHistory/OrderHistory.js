import React, { useState } from "react";
import "./OrderHistory.css";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const navigate = useNavigate();

  // ✅ Sample data (replace with API later)
  const ordersData = [
    {
      id: "ORD-1001",
      status: "Paid",
      amount: 16.97,
      token: 147,
      date: "2026-03-23 12:30",
      items: [
        { name: "Iced Latte", qty: 2, price: 9.98 },
        { name: "Loaded Fries", qty: 1, price: 6.99 },
      ],
    },
    {
      id: "ORD-1002",
      status: "Paid",
      amount: 18.48,
      token: 148,
      date: "2026-03-22 18:15",
      items: [],
    },
    {
      id: "ORD-1003",
      status: "Paid",
      amount: 10.47,
      token: 149,
      date: "2026-03-21 09:45",
      items: [],
    },
  ];

  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <div className="history-container">

      {/* Header */}
      <div className="header">
        <span className="back" onClick={() => navigate(-1)}>
          ← Back
        </span>
      </div>

      <div className="content">
        <h1 className="title">Order History</h1>
        <p className="subtitle">Your previous orders</p>

        {ordersData.map((order, index) => (
          <div key={index} className="order-card">

            {/* Top Section */}
            <div
              className="order-top"
              onClick={() => toggleExpand(index)}
            >
              <div>
                <div className="order-id-row">
                  <h3>{order.id}</h3>
                  <span className="status">{order.status}</span>
                </div>

                <p className="order-sub">
                  Token #{order.token} · {order.date}
                </p>
              </div>

              <div className="right">
                <span className="amount">${order.amount}</span>
                <span className="arrow">
                  {expanded === index ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {/* Expand Section */}
            {expanded === index && order.items.length > 0 && (
              <div className="order-items">
                {order.items.map((item, i) => (
                  <div key={i} className="item-row">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>${item.price}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;