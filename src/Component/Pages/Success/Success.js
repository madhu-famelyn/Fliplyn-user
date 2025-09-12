import React, { useEffect, useState, useRef } from "react";
import "./Success.css";
import { useLocation, useNavigate } from "react-router-dom";
import { BsCheck } from "react-icons/bs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [view, setView] = useState("receipt"); // toggle view
  const receiptRef = useRef(null);

  useEffect(() => {
    const order = location.state?.order;
    if (order) {
      // Use the order object directly
      setOrderDetails(order);
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

  const {
    cgst = 0,
    sgst = 0,
    total_gst = 0,
    round_off = 0,
    total_amount = 0,
  } = orderDetails;

  const roundedTotal = Math.round(total_amount + round_off);

  // 👇 Build full QR payload with all order details
  const qrPayload = JSON.stringify({
    ...orderDetails,
    token_no: tokenNo,
    created_at: createdAt,
    rounded_total: roundedTotal,
  });

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
                <td>Total (Rs)</td>
                <td></td>
                <td>{total_amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Round Off (Rs)</td>
                <td></td>
                <td>
                  {round_off >= 0
                    ? `+ ${round_off.toFixed(2)}`
                    : `- ${Math.abs(round_off).toFixed(2)}`}
                </td>
              </tr>
              <tr className="grand-total-row">
                <td>
                  <strong>Grand Total (Rs)</strong>
                </td>
                <td></td>
                <td>
                  <strong>{roundedTotal.toFixed(2)}</strong>
                </td>
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
          <QRCodeCanvas value={qrPayload} size={180} />
        </div>
      )}
    </div>
  );
}
