import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import axios from "axios";
import { BsCheck } from "react-icons/bs";
import "./Receipt.css"; // ✅ your print styles

export default function QRScannerReceipt() {
  const videoRef = useRef(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");
  const [tokenInput, setTokenInput] = useState(""); // ✅ manual token input
  const codeReaderRef = useRef(null);

  // ✅ QR Scanner setup
  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    // Start scanning using default camera
    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
        if (result) {
          try {
            const qrData = JSON.parse(result.getText());

            if (qrData.id) {
              // If QR has order id, fetch order details
              const res = await axios.get(`http://127.0.0.1:8000/orders/${qrData.id}`);
              setOrderDetails(res.data);
            } else {
              // If QR already has full order details
              setOrderDetails(qrData);
            }

            // Stop scanning after successful read
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

    // Cleanup on unmount
    return () => {
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // ✅ Auto-print when orderDetails is set
  useEffect(() => {
    if (orderDetails) {
      setTimeout(() => {
        window.print();

        // Refresh page after printing finishes
        window.onafterprint = () => {
          window.location.reload();
        };
      }, 200); // 200ms to ensure DOM rendered
    }
  }, [orderDetails]);

  // ✅ Manual fetch by token number
  const fetchByToken = async () => {
    if (!tokenInput) {
      setError("Please enter a token number");
      return;
    }
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/orders/orders/by-token/${tokenInput}`
      );
      setOrderDetails(res.data);
      setError("");
    } catch (err) {
      setError("Invalid token number or order not found");
      console.error(err);
    }
  };

  if (!orderDetails)
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Scan QR Code or Enter Token</h2>
        <video
          ref={videoRef}
          style={{ width: "300px", height: "300px", border: "1px solid #ccc" }}
        />
        <div style={{ marginTop: "20px" }}>
          <input
            type="number"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter Token Number"
            style={{ padding: "8px", width: "200px", marginRight: "10px" }}
          />
          <button onClick={fetchByToken} style={{ padding: "8px 16px" }}>
            Fetch & Print
          </button>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );

  // ✅ Render KOT/Receipt
  const tokenNo = orderDetails.token_number ?? orderDetails.id.slice(0, 4);
  const createdAt = new Date(orderDetails.created_datetime).toLocaleString("en-IN", {
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const { cgst = 0, sgst = 0, total_gst = 0, round_off = 0, total_amount = 0 } =
    orderDetails;

  const roundedTotal = Math.round(total_amount + round_off);

  return (
    <div className="view-wrapper print-wrapper">
      <div className="view-status print-status">
        <p className="view-success print-success">
          <span className="view-icon print-icon">
            <BsCheck />
          </span>{" "}
          Payment Successful
        </p>
      </div>

      <div className="view-card print-card">
        <h2 className="view-stall print-stall">
          {orderDetails.order_details[0]?.stall_name || "Stall Name"}
        </h2>
        <p className="view-token print-token">
          Token No.: <strong>{tokenNo}</strong>
        </p>
        <p>Pre-paid</p>
        <p className="view-date print-date">Date: {createdAt}</p>

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
              <td>Total</td>
              <td></td>
              <td>{total_amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Round Off</td>
              <td></td>
              <td>
                {round_off >= 0
                  ? `+ ${round_off.toFixed(2)}`
                  : `- ${Math.abs(round_off).toFixed(2)}`}
              </td>
            </tr>
            <tr className="view-grand print-grand">
              <td>
                <strong>Grand Total</strong>
              </td>
              <td></td>
              <td>
                <strong>{roundedTotal.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
          <div className="row-valid-message">
            <h2 className="valid-message">Valid for 30 mins</h2>
          </div>
        </table>
      </div>
    </div>
  );
}
