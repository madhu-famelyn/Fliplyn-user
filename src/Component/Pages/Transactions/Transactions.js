import React, { useEffect, useState, useRef } from "react";
import { getOrderDetailsByUserId } from "./Service";
import { useAuth } from "../../AuthContext/ContextApi";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Transactions.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function Transactions() {
  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, orderId: null });

  useEffect(() => {
    if (!userId) return;

    getOrderDetailsByUserId(userId)
      .then((data) => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, [userId]);

  /* =======================
     PAYMENT HELPERS
  ======================= */

  const isPaymentSuccessful = (order) => {
    return (
      order.paid_with_wallet === true ||
      order.payment_verified === true ||
      order.payment_status === "SUCCESS"
    );
  };

  const getPaymentMethod = (order) => {
    if (order.paid_with_wallet) return "Paid via Wallet";
    if (order.payment_verified) return "Paid via Cashfree";
    return "Payment Failed";
  };

  const canDownload = (order) => {
    return isPaymentSuccessful(order);
  };

  const isQRExpired = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    return (now - createdTime) / (1000 * 60) > 60;
  };

  const canShowQR = (order) => {
    return isPaymentSuccessful(order) && !isQRExpired(order.created_datetime);
  };

  /* =======================
     RECEIPT DOWNLOAD
  ======================= */

  const fetchAndDownload = async (orderId) => {
    try {
      const res = await axios.get(
        `https://admin-aged-field-2794.fly.dev/orders/${orderId}`
      );
      setSelectedOrder(res.data);
      setTimeout(() => downloadPDF(res.data.token_number), 300);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    }
  };

  const downloadPDF = (tokenNumber) => {
    const input = receiptRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt_${tokenNumber}.pdf`);
    });
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <>
      <Header />

      <div className="txn-wrapper">
        {loading ? (
          <p className="txn-loading">Loading transactions...</p>
        ) : !orders.length ? (
          <p className="txn-empty">No transactions found.</p>
        ) : (
          <div className="txn-container">
            <h2 className="txn-title">Transaction History</h2>

            <div className="txn-table">
              <div className="txn-header">
                <span>Date</span>
                <span>Token</span>
                <span>Amount</span>
                <span>Payment Method</span>
                <span>Status</span>
                <span>Download</span>
                <span>QR</span>
              </div>

              {orders.map((order) => {
                const success = isPaymentSuccessful(order);
                const qrExpired = isQRExpired(order.created_datetime);

                return (
                  <div key={order.id} className="txn-row">
                    <span>
                      {new Date(order.created_datetime).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </span>

                    <span>{order.token_number}</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                    <span>{getPaymentMethod(order)}</span>

                    <span
                      className={`txn-status ${
                        success ? "success" : "failed"
                      }`}
                    >
                      {success ? "Success" : "Failed"}
                    </span>

                    {/* DOWNLOAD */}
                    <span>
                      {canDownload(order) ? (
                        <button
                          className="txn-download-button"
                          onClick={() => fetchAndDownload(order.id)}
                        >
                          Download
                        </button>
                      ) : (
                        <span className="txn-no-download">—</span>
                      )}
                    </span>

                    {/* QR */}
                    <span className="txn-qr">
                      {canShowQR(order) ? (
                        <div
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setQrModal({ open: true, orderId: order.id })
                          }
                        >
                          <QRCodeCanvas
                            value={`https://admin-aged-field-2794.fly.dev/receipt/${order.id}`}
                            size={60}
                          />
                        </div>
                      ) : !success ? (
                        <p className="qr-expired">Payment Failed</p>
                      ) : qrExpired ? (
                        <p className="qr-expired">QR Expired</p>
                      ) : (
                        <span className="txn-no-download">—</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* QR MODAL */}
      {qrModal.open && (
        <div
          className="qr-modal-overlay"
          onClick={() => setQrModal({ open: false, orderId: null })}
        >
          <div
            className="qr-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Order QR Code</h3>
            <QRCodeCanvas
              value={`https://admin-aged-field-2794.fly.dev/receipt/${qrModal.orderId}`}
              size={250}
            />
          </div>
        </div>
      )}

      {/* HIDDEN RECEIPT */}
      {selectedOrder && (
        <div style={{ position: "absolute", left: "-9999px" }}>
          <div ref={receiptRef} className="txn-pdf-receipt-card">
            <h2 className="txn-stall-name">
              {selectedOrder.order_details[0]?.stall_name || "Stall"}
            </h2>

            <p>
              Token No: <strong>{selectedOrder.token_number}</strong>
            </p>

            <p>
              Date:{" "}
              {new Date(selectedOrder.created_datetime).toLocaleString("en-IN")}
            </p>

            <hr />

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.order_details.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toFixed(2)}</td>
                  </tr>
                ))}

                <tr>
                  <td>Total GST</td>
                  <td></td>
                  <td>{selectedOrder.total_gst.toFixed(2)}</td>
                </tr>

                <tr className="txn-grand-total-row">
                  <td>
                    <strong>Grand Total</strong>
                  </td>
                  <td></td>
                  <td>
                    <strong>
                      {selectedOrder.total_amount.toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer/>
    </>
  );
}
