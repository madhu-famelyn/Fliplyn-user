import React, { useEffect, useState } from 'react';
import './Success.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BsCheck } from 'react-icons/bs';

export default function PaymentSuccess() {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const order = location.state?.order;
    if (order?.id) {
      fetchOrderDetails(order.id);
    }
  }, [location]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`https://fliplyn.onrender.com/orders/${orderId}`);
      setOrderDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  };

  if (!orderDetails) {
    return <p className="loading-text">Loading...</p>;
  }

  // Convert UTC to IST (add 5 hours and 30 minutes)
  const utcDate = new Date(orderDetails.created_datetime);
  const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
  const createdAt = istDate.toLocaleString('en-IN', {
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  const item = orderDetails.order_details[0]; // assuming 1 item per order
  const tokenNo = orderDetails.id.slice(0, 4); // simulate a token

  const CGST = 0.13;
  const SGST = 0.13;
  const taxTotal = CGST + SGST;
  const roundedTotal = Math.round(orderDetails.total_amount);
  const roundOff = (roundedTotal - orderDetails.total_amount).toFixed(2);

  return (
    <div className="receipt-wrapper">
      <div className="status-wrapper">
        <p className="success-status">
          <span className="success-icon"><BsCheck /></span> Payment Successful
        </p>
      </div>

      <div className="receipt-card">
        <h2 className="stall-name">{item.stall_name}</h2>
        <p className="token-no">Token No.: {tokenNo}</p>
        <p className="order-date">Date: {createdAt}</p>

        <hr className="separator" />

        <table className="receipt-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Qty.</th>
              <th>Price (Rs)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price.toFixed(2)}</td>
            </tr>
            <tr>
              <td>CGST</td>
              <td></td>
              <td>{CGST.toFixed(2)}</td>
            </tr>
            <tr>
              <td>SGST</td>
              <td></td>
              <td>{SGST.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total (Rs)</td>
              <td></td>
              <td>{(item.total + taxTotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Round Off (Rs)</td>
              <td></td>
              <td>{roundOff > 0 ? `+ ${roundOff}` : `( - ) ${Math.abs(roundOff)}`}</td>
            </tr>
            <tr className="grand-total-row">
              <td><strong>Grand Total (Rs)</strong></td>
              <td></td>
              <td><strong>{roundedTotal.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="download-btn">Download Receipt</button>
    </div>
  );
}
