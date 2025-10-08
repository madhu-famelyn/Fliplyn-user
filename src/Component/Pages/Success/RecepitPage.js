import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BsCheck } from "react-icons/bs";
import "./Receipt.css"; // ✅ make sure print styles are included

export default function ReceiptPage() {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);

  // Fetch order details
  useEffect(() => {
    axios
      .get(`https://fliplyn.onrender.com/orders/${id}`)
      .then((res) => {
        setOrderDetails(res.data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Trigger print AFTER orderDetails is loaded
  useEffect(() => {
    if (orderDetails) {
      // Small timeout to ensure DOM fully renders
      setTimeout(() => {
        window.print();
      }, 100); // 100ms is usually enough
    }
  }, [orderDetails]);

  if (!orderDetails) return <p className="view-loading">Loading...</p>;

  const tokenNo = orderDetails.token_number ?? orderDetails.id.slice(0, 4);
  const createdAt = new Date(orderDetails.created_datetime).toLocaleString(
    "en-IN",
    { hour12: true, timeZone: "Asia/Kolkata" }
  );

  const {
    cgst = 0,
    sgst = 0,
    total_gst = 0,
    round_off = 0,
    total_amount = 0,
  } = orderDetails;

  const roundedTotal = Math.round(total_amount + round_off);

  return (
    <div className="view-wrapper print-wrapper">
      <div className="view-status print-status">
        <p className="view-success print-success">
          <span className="view-icon print-icon">
            <BsCheck />
          </span>{" "}
          Payment Successful
        </p>
      </div>

      <div className="view-card print-card">
        <h2 className="view-stall print-stall">
          {orderDetails.order_details[0]?.stall_name || "Stall Name"}
        </h2>
        <p className="view-token print-token">
          Token No.: <strong>{tokenNo}</strong>
        </p>
        <p className="view-date print-date">Date: {createdAt}</p>

        <hr className="view-separator print-separator" />

        <table className="view-table print-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rs</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.order_details.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td>CGST</td>
              <td></td>
              <td>{cgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td>SGST</td>
              <td></td>
              <td>{sgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total GST</td>
              <td></td>
              <td>{total_gst.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total</td>
              <td></td>
              <td>{total_amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Round Off</td>
              <td></td>
              <td>
                {round_off >= 0
                  ? `+ ${round_off.toFixed(2)}`
                  : `- ${Math.abs(round_off).toFixed(2)}`}
              </td>
            </tr>
            <tr className="view-grand print-grand">
              <td>
                <strong>Grand Total</strong>
              </td>
              <td></td>
              <td>
                <strong>{roundedTotal.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
