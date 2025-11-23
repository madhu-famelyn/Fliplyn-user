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

  const totalCgst = orderDetails.cgst ?? 0;
  const totalSgst = orderDetails.sgst ?? 0;
  const totalGst = orderDetails.total_gst ?? totalCgst + totalSgst;
  const roundOff = orderDetails.round_off ?? 0;
  const grandTotal = orderDetails.total_amount ?? 0;

  // Calculate subtotal before round off
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
                <span className="item-name">{item.name} X {item.quantity}</span>
                <span>{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

         

         <div className="token-summary" style={{ maxWidth: "400px", margin: "0 auto" }}>
  <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
    <span>CGST</span>
    <span>{totalCgst.toFixed(2)}</span>
  </p>
  <hr className="separator" />
  <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
    <span>SGST</span>
    <span>{totalSgst.toFixed(2)}</span>
  </p>
  <hr className="separator" />
  <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
    <span>Total GST</span>
    <span>{totalGst.toFixed(2)}</span>
  </p>
  <hr className="separator" />
  <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
    <span>Total</span>
    <span>{subtotal.toFixed(2)}</span>
  </p>
  <hr className="separator" />
  <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
    <span>Round Off</span>
    <span>{roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</span>
  </p>
  <p
    className="grand-total"
    style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop: "8px" }}
  >
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
    </div>
  );
}
