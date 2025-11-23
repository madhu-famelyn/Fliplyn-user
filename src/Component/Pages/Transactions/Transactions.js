import React, { useEffect, useState, useRef } from "react";
import { getOrderDetailsByUserId } from "./Service";
import { useAuth } from "../../AuthContext/ContextApi";
import Header from "../Header/Header";
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

  // QR Modal
  const [qrModal, setQrModal] = useState({ open: false, orderId: null });

  useEffect(() => {
    if (userId) {
      getOrderDetailsByUserId(userId)
        .then((data) => {
          setOrders(data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching orders:", err);
          setLoading(false);
        });
    }
  }, [userId]);

  const fetchAndDownload = async (orderId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/orders/${orderId}`
      );
      setSelectedOrder(res.data);
      setTimeout(() => downloadPDF(res.data.token_number, res.data), 300);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    }
  };

  const downloadPDF = (tokenNumber) => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt_${tokenNumber}.pdf`);
    });
  };

  // QR Expiry (1 hour)
  const isQRExpired = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - createdTime) / (1000 * 60);
    return diffMinutes > 60;
  };

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
                <span>Token No.</span>
                <span>Amount</span>
                <span>Payment Method</span>
                <span>Status</span>
                <span>Download</span>
                <span>QR</span>
              </div>

              {orders.map((order) => {
                const isFailed = order.total_amount === 0;
                const qrExpired = isQRExpired(order.created_datetime);

                return (
                  <div key={order.id} className="txn-row">
                    <span>
                      {new Date(order.created_datetime).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span>{order.token_number}</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                    <span>{order.payment_method_detail || "Wallet"}</span>
                    <span
                      className={`txn-status ${
                        isFailed ? "failed" : "success"
                      }`}
                    >
                      {isFailed ? "Failed" : "Success"}
                    </span>
                    <span>
                      {!isFailed ? (
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
                    <span className="txn-qr">
                      {!isFailed ? (
                        qrExpired ? (
                          <p className="qr-expired">QR Expired</p>
                        ) : (
                          <div
                            onClick={() =>
                              setQrModal({ open: true, orderId: order.id })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <QRCodeCanvas
                              value={`http://127.0.0.1:8000/receipt/${order.id}`}
                              size={60}
                            />
                          </div>
                        )
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

      {/* QR Modal */}
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
              value={`http://127.0.0.1:8000/receipt/${qrModal.orderId}`}
              size={250}
            />
          </div>
        </div>
      )}

      {/* Hidden PDF Receipt */}
      {selectedOrder && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div ref={receiptRef} className="txn-pdf-receipt-card">
            <h2 className="txn-stall-name">
              {selectedOrder.order_details[0]?.stall_name || "Stall Name"}
            </h2>

            <p className="txn-pdf-token-no">
              Token No.: <strong>{selectedOrder.token_number}</strong>
            </p>
            <p className="txn-pdf-order-date">
              Date:{" "}
              {new Date(selectedOrder.created_datetime).toLocaleString(
                "en-IN",
                {
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                }
              )}
            </p>

            <hr />
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Qty.</th>
                  <th>Price (Rs)</th>
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

                {/* GST Rows */}
                <tr>
                  <td>CGST</td>
                  <td></td>
                  <td>{selectedOrder.cgst.toFixed(3)}</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td></td>
                  <td>{selectedOrder.sgst.toFixed(3)}</td>
                </tr>
                <tr>
                  <td>Total GST</td>
                  <td></td>
                  <td>{selectedOrder.total_gst.toFixed(2)}</td>
                </tr>

                {/* Total before round-off */}
                <tr>
                  <td>Total (Rs)</td>
                  <td></td>
                  <td>
                    {(
                      selectedOrder.total_amount - selectedOrder.round_off
                    ).toFixed(2)}
                  </td>
                </tr>

                {/* Round Off */}
                <tr>
                  <td>Round Off (Rs)</td>
                  <td></td>
                  <td>
                    {selectedOrder.round_off >= 0
                      ? `+ ${selectedOrder.round_off.toFixed(2)}`
                      : `- ${Math.abs(selectedOrder.round_off).toFixed(2)}`}
                  </td>
                </tr>

                {/* Grand Total */}
                <tr className="txn-grand-total-row">
                  <td>
                    <strong>Grand Total (Rs)</strong>
                  </td>
                  <td></td>
                  <td>
                    <strong>{selectedOrder.total_amount.toFixed(2)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
