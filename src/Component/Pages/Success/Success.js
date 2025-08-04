import React, { useEffect, useState, useRef } from 'react';
import './Success.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BsCheck } from 'react-icons/bs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PaymentSuccess() {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const receiptRef = useRef(null);

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

  const downloadPDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt_${orderDetails.id.slice(0, 6)}.pdf`);
    });
  };

  if (!orderDetails) return <p className="loading-text">Loading...</p>;

  const tokenNo = orderDetails.token_number ?? orderDetails.id.slice(0, 4); // fallback
  const createdAt = new Date(orderDetails.created_datetime).toLocaleString('en-IN', {
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

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

      <div className="receipt-card" ref={receiptRef}>
        <h2 className="stall-name">{orderDetails.order_details[0]?.stall_name}</h2>
        <p className="token-no">Token No.: <strong>{tokenNo}</strong></p>
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
              <td>{(orderDetails.total_amount + taxTotal).toFixed(2)}</td>
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

      <button className="download-btn" onClick={downloadPDF}>Download Receipt</button>
      <button className="download-btn" onClick={downloadPDF}>Back to Home</button>
    </div>
  );
}
