import React, { useEffect, useState, useRef } from "react";
import "./Success.css";
import { useLocation, useNavigate } from "react-router-dom";
import { BsCheck } from "react-icons/bs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [view, setView] = useState("receipt");
  const receiptRef = useRef(null);

  useEffect(() => {
    const order = location.state?.order;
    if (order?.id) {
      axios
        .get(`https://admin-aged-field-2794.fly.dev/orders/${order.id}`)
        .then((res) => setOrderDetails(res.data))
        .catch((err) => console.error("Error fetching order:", err));
    }
  }, [location]);

  const downloadPDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt_${orderDetails.id.slice(0, 6)}.pdf`);

      setTimeout(() => {
        navigate("/stalls");
      }, 1000);
    });
  };

  if (!orderDetails) return <p className="loading-text">Loading...</p>;

  const tokenNo = orderDetails.token_number ?? orderDetails.id.slice(0, 4);
  const createdAt = new Date(orderDetails.created_datetime).toLocaleString(
    "en-IN",
    { hour12: true, timeZone: "Asia/Kolkata" }
  );

  // --- GST & Total Calculation ---
  let totalBasePrice = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalGst = 0;
  let totalWithGst = 0;

  orderDetails.order_details.forEach((item) => {
    const basePrice = item.price; // already base price (without GST)
    const cgst = basePrice * 0.025;
    const sgst = basePrice * 0.025;
    const totalItemGst = cgst + sgst;
    const priceWithGst = basePrice + totalItemGst;

    totalBasePrice += basePrice * item.quantity;
    totalCgst += cgst * item.quantity;
    totalSgst += sgst * item.quantity;
    totalGst += totalItemGst * item.quantity;
    totalWithGst += priceWithGst * item.quantity;
  });

  // Use backend round_off if available, else compute locally
  const roundOff =
    orderDetails.round_off ??
    Math.round(orderDetails.total_amount) - totalWithGst;
  const grandTotal = totalWithGst + roundOff;

  return (
    <div className="receipt-wrapper">
      <div className="status-wrapper">
        <p className="success-status">
          <span className="success-icon">
            <BsCheck />
          </span>{" "}
          Payment Successful
        </p>
      </div>

      {/* Toggle Buttons */}
      <div className="toggle-btns">
        <button
          className={`toggle-btn ${view === "receipt" ? "active" : ""}`}
          onClick={() => setView("receipt")}
        >
          Show Receipt
        </button>
        <button
          className={`toggle-btn ${view === "qr" ? "active" : ""}`}
          onClick={() => setView("qr")}
        >
          Show QR
        </button>
      </div>

      {/* Receipt Section */}
      {view === "receipt" && (
        <div className="receipt-card" ref={receiptRef}>
          <h2 className="stall-name">
            {orderDetails.order_details[0]?.stall_name || "Stall Name"}
          </h2>
          <p className="token-no">
            Token No.: <strong>{tokenNo}</strong>
          </p>
          <p className="order-date">Date: {createdAt}</p>

          <hr className="separator" />

          <table className="receipt-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.order_details.map((item, index) => {
                const basePrice = item.price;
                const cgst = basePrice * 0.025;
                const sgst = basePrice * 0.025;
                const totalGstItem = cgst + sgst;
                const priceWithGst = basePrice + totalGstItem;

                return (
                  <React.Fragment key={index}>

                    <tr>
                      <td>Base Price</td>
                      <td>{basePrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>CGST</td>
                      <td>{cgst.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td>SGST </td>
                      <td>{sgst.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td>Total GST</td>
                      <td>{totalGstItem.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td>Price</td>
                      <td>{priceWithGst.toFixed(2)}</td>
                    </tr>
                  </React.Fragment>
                );
              })}

              <tr>
                <td><strong>Round Off</strong></td>
                <td>{roundOff.toFixed(2)}</td>
              </tr>
              <tr className="grand-total-row">
                <td><strong>Grand Total</strong></td>
                <td><strong>{grandTotal.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <button className="download-btn" onClick={downloadPDF}>
            Download Receipt
          </button>
        </div>
      )}

      {/* QR Section */}
      {view === "qr" && (
        <div className="qr-wrapper">
          <QRCodeCanvas value={JSON.stringify(orderDetails)} size={180} />
        </div>
      )}
    </div>
  );
}
