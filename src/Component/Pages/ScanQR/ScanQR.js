import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import axios from "axios";
import { BsCheck } from "react-icons/bs";
import "./Receipt.css";

export default function QRScannerReceipt() {
  const videoRef = useRef(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const codeReaderRef = useRef(null);

  // ✅ QR Scanner setup
  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
        if (result) {
          try {
            const qrData = JSON.parse(result.getText());
            let order;

            if (qrData.id) {
              const res = await axios.get(
                `https://admin-aged-field-2794.fly.dev/orders/${qrData.id}`
              );
              order = res.data;
            } else {
              order = qrData;
            }

            setOrderDetails(order);
            codeReader.stop();
          } catch (e) {
            setError("Invalid QR JSON or unable to fetch order");
            console.error(e);
          }
        }
        if (err && !(err.name === "NotFoundException")) {
          console.error(err);
        }
      })
      .catch((err) => setError(err.message));

    return () => {
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // ✅ Manual fetch by token number
  const fetchByToken = async () => {
    if (!tokenInput) {
      setError("Please enter a token number");
      return;
    }
    try {
      const res = await axios.get(
        `https://admin-aged-field-2794.fly.dev/orders/orders/by-token/${tokenInput}`
      );
      setOrderDetails(res.data);
      setError("");
    } catch (err) {
      setError("Invalid token number or order not found");
      console.error(err);
    }
  };

  // ✅ Print handler with PAYMENT CHECK
  const handlePrint = async () => {
    if (!orderDetails) return;

    // ❌ If payment not completed, block printing
    if (
      orderDetails.payment_status !== "PAID" ||
      orderDetails.payment_verified !== true
    ) {
      alert("Payment Pending! Cannot print token.");
      return;
    }

    try {
      window.print();

      await axios.put(
        `https://admin-aged-field-2794.fly.dev/orders/${orderDetails.id}/print`
      );

      setOrderDetails((prev) => ({ ...prev, is_printed: true }));
    } catch (err) {
      console.error("Failed to mark as printed:", err);
    }
  };

  const isPaid =
    orderDetails?.payment_status === "PAID" &&
    orderDetails?.payment_verified === true;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Scan QR Code or Enter Token</h2>

      <video
        ref={videoRef}
        style={{ width: "300px", height: "300px", border: "1px solid #ccc" }}
      />

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Enter Token Number"
          style={{ padding: "8px", width: "200px", marginRight: "10px" }}
        />
        <button onClick={fetchByToken} style={{ padding: "8px 16px" }}>
          Fetch Receipt
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ❌ Payment pending warning */}
      {orderDetails && !isPaid && (
        <p style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>
          ⚠️ Payment Pending — Cannot Print Token
        </p>
      )}

      {/* ✔ Show print button only if PAID */}
      {orderDetails && isPaid && !orderDetails.is_printed && (
        <button
          onClick={handlePrint}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Print Receipt
        </button>
      )}

      {/* Already printed */}
      {orderDetails && orderDetails.is_printed && (
        <p style={{ color: "red", fontWeight: "bold", fontSize: "18px" }}>
          ⚠️ Already Printed (Token No.: {orderDetails.token_number})
        </p>
      )}

      {/* PRINT TEMPLATE */}
      {orderDetails && (
        <div className="print-receipt">
          <div className="view-wrapper print-wrapper">
            <div className="view-status print-status">
              <p className="view-success print-success">
                <span className="view-icon print-icon">
                  <BsCheck />
                </span>{" "}
                {isPaid ? "Payment Successful" : "Payment Pending"}
              </p>
            </div>

            <div className="view-card print-card">
              <h2 className="view-stall print-stall">
                {orderDetails.order_details[0]?.stall_name || "Stall Name"}
              </h2>
              <p className="view-token print-token">
                Token No.: <strong>{orderDetails.token_number}</strong>
              </p>
              <p>post-paid</p>

              <p className="view-date print-date">
                Date:{" "}
                {new Date(orderDetails.created_datetime).toLocaleString(
                  "en-IN",
                  { hour12: true, timeZone: "Asia/Kolkata" }
                )}
              </p>

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
                    <td>{(orderDetails.cgst || 0).toFixed(2)}</td>
                  </tr>

                  <tr>
                    <td>SGST</td>
                    <td></td>
                    <td>{(orderDetails.sgst || 0).toFixed(2)}</td>
                  </tr>

                  <tr>
                    <td>Total GST</td>
                    <td></td>
                    <td>{(orderDetails.total_gst || 0).toFixed(2)}</td>
                  </tr>

                  <tr>
                    <td>Total</td>
                    <td></td>
                    <td>{(orderDetails.total_amount || 0).toFixed(2)}</td>
                  </tr>

                  <tr>
                    <td>Round Off</td>
                    <td></td>
                    <td>
                      {orderDetails.round_off >= 0
                        ? `+ ${(orderDetails.round_off || 0).toFixed(2)}`
                        : `- ${Math.abs(orderDetails.round_off || 0).toFixed(
                            2
                          )}`}
                    </td>
                  </tr>

                  <tr className="view-grand print-grand">
                    <td>
                      <strong>Grand Total</strong>
                    </td>
                    <td></td>
                    <td>
                      <strong>
                        {Math.round(
                          (orderDetails.total_amount || 0) +
                            (orderDetails.round_off || 0)
                        ).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="row-valid-message">
                <h2 className="valid-message">Valid for 30 mins</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
