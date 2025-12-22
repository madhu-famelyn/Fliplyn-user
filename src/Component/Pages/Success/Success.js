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
  const [showToken, setShowToken] = useState(false);
  const receiptRef = useRef(null);

  // ⏱ Show token after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToken(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

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
    });
  };

  if (!orderDetails) return <p className="loading-text">Loading...</p>;

  const tokenNo = orderDetails.token_number ?? orderDetails.id.slice(0, 4);
  const createdAt = new Date(orderDetails.created_datetime).toLocaleString(
    "en-IN",
    { hour12: true, timeZone: "Asia/Kolkata" }
  );

  const totalCgst = orderDetails.cgst ?? 0;
  const totalSgst = orderDetails.sgst ?? 0;
  const totalGst = orderDetails.total_gst ?? totalCgst + totalSgst;
  const roundOff = orderDetails.round_off ?? 0;
  const grandTotal = orderDetails.total_amount ?? 0;
  const subtotal = grandTotal - roundOff;

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

      {/* ⚠️ Validity Message (First 10 seconds) */}
      {!showToken && (
        <div className="order-validity-box">
          <p className="order-validity-text">
            This order is valid for <strong>30 minutes</strong>.  
            After 30 minutes, the order will not be processed and the amount will not be refunded.
          </p>
        </div>
      )}

      {/* 🎟 Token / Receipt */}
      {showToken && (
        <>
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

          {view === "receipt" && (
            <div className="receipt-card compact-token" ref={receiptRef}>
              <h2 className="stall-name">
                {orderDetails.order_details[0]?.stall_name || "Stall Name"}
              </h2>
              <p className="token-no">
                Token No.: <strong>{tokenNo}</strong>
              </p>
              <p className="order-date">Date: {createdAt}</p>

              <hr className="separator" />

              <div className="token-table">
                <div className="token-header">
                  <span>Item</span>
                  <span>Rs</span>
                </div>

                {orderDetails.order_details.map((item, index) => (
                  <div key={index} className="token-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="token-summary">
                <p><span>CGST</span><span>{totalCgst.toFixed(2)}</span></p>
                <p><span>SGST</span><span>{totalSgst.toFixed(2)}</span></p>
                <p><span>Total GST</span><span>{totalGst.toFixed(2)}</span></p>
                <p><span>Total</span><span>{subtotal.toFixed(2)}</span></p>
                <p><span>Round Off</span><span>{roundOff.toFixed(2)}</span></p>
                <p className="grand-total">
                  <span>Grand Total</span>
                  <span>{grandTotal.toFixed(2)}</span>
                </p>
              </div>

              <button className="download-btn" onClick={downloadPDF}>
                Download Receipt
              </button>
            </div>
          )}

          {view === "qr" && (
            <div className="qr-wrapper">
              <QRCodeCanvas value={JSON.stringify(orderDetails)} size={180} />
            </div>
          )}

          {/* 🔙 Back to Stalls */}
          <button
            className="back-to-stalls-btn"
            onClick={() => navigate("/stalls")}
          >
            Back to Stalls
          </button>
        </>
      )}
    </div>
  );
}
