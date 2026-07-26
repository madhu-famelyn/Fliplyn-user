import React, { useEffect, useState, useRef } from "react";
import "./Success.css";
import { useLocation, useNavigate } from "react-router-dom";
import { BsCheck } from "react-icons/bs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.") ||
  window.location.hostname.startsWith("172.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:8000`
  : "https://admin-aged-field-2794.fly.dev";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(() => location.state?.order || null);
  const searchParams = new URLSearchParams(location.search);
  const cfOrderId =
    searchParams.get("cf_order_id") ||
    searchParams.get("order_id") ||
    location.state?.order?.cashfree_order_id ||
    location.state?.order?.id;

  const view = "receipt";
  const receiptRef = useRef(null);

  // Redirect to stalls if page accessed directly without any order ID or state
  useEffect(() => {
    if (!cfOrderId && !location.state?.order) {
      navigate("/stalls", { replace: true });
    }
  }, [cfOrderId, location.state, navigate]);

  useEffect(() => {
    const order = location.state?.order;
    if (order?.id) {
      localStorage.removeItem("cartItems");
      setOrderDetails(order);
      return;
    }

    if (cfOrderId) {
      axios
        .get(`${API_BASE}/orders/by-cashfree/${cfOrderId}`)
        .then((res) => {
          setOrderDetails(res.data);
          localStorage.removeItem("cartItems");
        })
        .catch((err) => {
          console.error("Error fetching order by cashfree:", err);
          navigate("/stalls", { replace: true });
        });
    }
  }, [location, cfOrderId, navigate]);

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

  if (!orderDetails) {
    return (
      <div className="receipt-wrapper" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center",
          padding: "40px 24px",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          maxWidth: "380px",
          width: "90%"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 20px",
            border: "4px solid #fff3eb",
            borderTopColor: "#eb4d26",
            borderRightColor: "#eb4d26",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
            Loading Receipt...
          </h2>
        </div>
      </div>
    );
  }

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
      <div className="payment-success-header">
        <div className="success-checkmark-glow">
          <span className="success-checkmark-icon">
            <BsCheck />
          </span>
        </div>
        <h1 className="success-title">Payment Successful</h1>
        <p className="success-subtitle">Thank you for your order!</p>
      </div>

      {/* 🎟 Token / Receipt */}
      <>
          {/* <div className="toggle-btns">
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
          </div> */}

          {view === "receipt" && (
            <>
              <div className="receipt-card compact-token" ref={receiptRef}>
                <h2 className="stall-name">
                  {orderDetails.order_details[0]?.stall_name || "Stall Name"}
                </h2>
                
                <div className="token-hero-badge">
                  <span className="token-hero-label">YOUR TOKEN NUMBER</span>
                  <h3 className="token-hero-number">{tokenNo}</h3>
                  <div style={{
                    marginTop: "8px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#b45309",
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    ⏱ Valid for 30 minutes only
                  </div>
                </div>

                <p className="order-date">Date: {createdAt}</p>

                <hr className="separator" />

                <div className="token-table">
                  <div className="token-header">
                    <span>Item</span>
                    <span>Rs</span>
                  </div>

                  {orderDetails.order_details.map((item, index) => (
                    <div key={index} className="token-row">
                      <span className="item-name">{item.name} × {item.quantity}</span>
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
                  <div className="separator" style={{ margin: "10px 0" }}></div>
                  <p className="grand-total">
                    <span>Grand Total</span>
                    <span>₹ {grandTotal.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <button className="download-btn" onClick={downloadPDF}>
                Download Receipt
              </button>
            </>
          )}

          {/* {view === "qr" && (
            <div className="qr-wrapper">
              <QRCodeCanvas value={JSON.stringify(orderDetails)} size={180} />
            </div>
          )} */}

          {/* 🔙 Back to Stalls */}
          <button
            className="back-to-stalls-btn"
            onClick={() => {
              localStorage.removeItem("cartItems");
              navigate("/stalls", { replace: true });
            }}
          >
            Back to Stalls
          </button>
        </>
    </div>
  );
}
