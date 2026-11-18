import React, { useEffect, useState, useRef } from "react";
import CoinEarnedPopup from "../MyCoins/CoinEarnedPopup";
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
  // ── Coin Earned Popup (mock: replace with real API data later) ──
  const [showCoinPopup, setShowCoinPopup] = useState(false);
  const coinsEarned = orderDetails
    ? Math.floor((orderDetails.total_amount || 0) / 100) * 2
    : 0;
  const mockNewBalance = 1240 + coinsEarned;

  useEffect(() => {
    if (orderDetails?.payment_status === "SUCCESS" && coinsEarned > 0) {
      const t = setTimeout(() => setShowCoinPopup(true), 1200);
      return () => clearTimeout(t);
    }
  }, [orderDetails, coinsEarned]);

  const receiptRef = useRef(null);

  // Redirect to stalls if page accessed directly without any order ID or state
  useEffect(() => {
    if (!cfOrderId && !location.state?.order) {
      navigate("/stalls", { replace: true });
    }
  }, [cfOrderId, location.state, navigate]);

  useEffect(() => {
    const order = location.state?.order;
    if (order?.id && order?.payment_status === "SUCCESS") {
      localStorage.removeItem("cartItems");
      setOrderDetails(order);
      return;
    }

    if (!cfOrderId) return;

    let isSubscribed = true;
    let pollInterval = null;

    const verifyAndFetchOrder = async () => {
      try {
        // 1. Trigger verification
        await axios.get(`${API_BASE}/orders/verify-payment/cashfree/${cfOrderId}`).catch(() => {});

        // 2. Fetch full order details
        const res = await axios.get(`${API_BASE}/orders/by-cashfree/${cfOrderId}`);
        if (!isSubscribed) return;

        setOrderDetails(res.data);

        if (res.data.payment_status === "SUCCESS") {
          localStorage.removeItem("cartItems");
          if (pollInterval) clearInterval(pollInterval);
        } else if (res.data.payment_status === "FAILED") {
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Error verifying/fetching order:", err);
      }
    };

    verifyAndFetchOrder();
    pollInterval = setInterval(verifyAndFetchOrder, 2000);

    return () => {
      isSubscribed = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [location, cfOrderId, navigate]);

  const downloadPDF = () => {
    const input = receiptRef.current;
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt_${orderDetails?.id ? orderDetails.id.slice(0, 6) : "order"}.pdf`);
    });
  };

  const tokenNo = orderDetails?.token_number ?? orderDetails?.id?.slice(0, 4) ?? "";
  const createdAt = orderDetails?.created_datetime
    ? new Date(orderDetails.created_datetime).toLocaleString("en-IN", {
        hour12: true,
        timeZone: "Asia/Kolkata",
      })
    : "";

  const totalCgst = orderDetails?.cgst ?? 0;
  const totalSgst = orderDetails?.sgst ?? 0;
  const totalGst = orderDetails?.total_gst ?? totalCgst + totalSgst;
  const roundOff = orderDetails?.round_off ?? 0;
  const grandTotal = orderDetails?.total_amount ?? 0;
  const subtotal = grandTotal - roundOff;

  const [activeStallIndex, setActiveStallIndex] = useState(0);
  const carouselRef = useRef(null);

  // ── Parse stall groups for sliding / scrolling tokens carousel ──
  const stallGroups = React.useMemo(() => {
    if (!orderDetails) return [];

    const tokenList = (orderDetails.token_number || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // 1. If backend returned explicit sub-orders
    if (orderDetails.orders && Array.isArray(orderDetails.orders) && orderDetails.orders.length > 0) {
      return orderDetails.orders.map((sub, idx) => {
        const itemSubtotal = (sub.order_details || []).reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0
        );
        let subCgst = typeof sub.cgst === "number" ? sub.cgst : null;
        let subSgst = typeof sub.sgst === "number" ? sub.sgst : null;
        let subGst = typeof sub.total_gst === "number" ? sub.total_gst : null;

        if (subGst === null && subCgst !== null && subSgst !== null) {
          subGst = subCgst + subSgst;
        } else if (subGst !== null && (subCgst === null || subSgst === null)) {
          subCgst = subGst / 2;
          subSgst = subGst / 2;
        } else if (subGst === null) {
          const itemsGst = (sub.order_details || []).reduce((sum, item) => {
            const itemBase = (item.price || 0) * (item.quantity || 1);
            return (
              sum +
              (typeof item.gst_amount === "number"
                ? item.gst_amount
                : (itemBase * (item.gst_percent || 0)) / 100)
            );
          }, 0);
          subGst = itemsGst;
          subCgst = itemsGst / 2;
          subSgst = itemsGst / 2;
        }

        const subRound = typeof sub.round_off === "number" ? sub.round_off : 0;
        const subTotalAmount =
          typeof sub.total_amount === "number"
            ? sub.total_amount
            : itemSubtotal + (subGst || 0) + subRound;
        const subReceiptTotal = subTotalAmount - subRound;

        return {
          stall_name:
            sub.stall_name ||
            sub.order_details?.[0]?.stall_name ||
            `Outlet ${idx + 1}`,
          token_number: sub.token_number || tokenList[idx] || tokenNo,
          order_details: sub.order_details || [],
          cgst: subCgst || 0,
          sgst: subSgst || 0,
          total_gst: subGst || 0,
          round_off: subRound,
          total: subReceiptTotal,
          total_amount: subTotalAmount,
          item_subtotal: itemSubtotal,
        };
      });
    }

    // 2. Otherwise, group order_details items by stall_name / stall_id
    const map = {};
    (orderDetails.order_details || []).forEach((item) => {
      const sName = item.stall_name || "Stall Name";
      if (!map[sName]) {
        map[sName] = {
          stall_name: sName,
          order_details: [],
          subtotal: 0,
          total_gst: 0,
        };
      }
      map[sName].order_details.push(item);
      const itemBase = (item.price || 0) * (item.quantity || 1);
      const itemGst =
        typeof item.gst_amount === "number"
          ? item.gst_amount
          : (itemBase * (item.gst_percent || 0)) / 100;
      map[sName].subtotal += itemBase;
      map[sName].total_gst += itemGst;
    });

    const groups = Object.keys(map).map((sName, idx) => {
      const g = map[sName];
      let cgst = g.total_gst / 2;
      let sgst = g.total_gst / 2;
      let gst = g.total_gst;
      if (Object.keys(map).length === 1 && totalGst > 0) {
        cgst = totalCgst;
        sgst = totalSgst;
        gst = totalGst;
      }
      const sTotal = g.subtotal + gst;
      return {
        stall_name: sName,
        token_number:
          tokenList[idx] || (tokenList.length === 1 ? tokenList[0] : tokenNo),
        order_details: g.order_details,
        cgst: cgst,
        sgst: sgst,
        total_gst: gst,
        round_off: 0,
        total: sTotal,
        total_amount: sTotal,
        item_subtotal: g.subtotal,
      };
    });

    return groups.length > 0
      ? groups
      : [
          {
            stall_name:
              orderDetails.order_details?.[0]?.stall_name || "Stall Name",
            token_number: tokenNo,
            order_details: orderDetails.order_details || [],
            cgst: totalCgst,
            sgst: totalSgst,
            total_gst: totalGst,
            round_off: roundOff,
            total: subtotal,
            total_amount: grandTotal,
            item_subtotal: subtotal - totalGst,
          },
        ];
  }, [
    orderDetails,
    tokenNo,
    totalCgst,
    totalSgst,
    totalGst,
    grandTotal,
    subtotal,
    roundOff,
  ]);

  const handleScroll = (e) => {
    const container = e.target;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const slides = container.children;
    if (!slides || slides.length === 0) return;

    let closestIndex = 0;
    let minDiff = Infinity;
    const containerCenter = scrollLeft + container.clientWidth / 2;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const diff = Math.abs(containerCenter - slideCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (
      closestIndex !== activeStallIndex &&
      closestIndex >= 0 &&
      closestIndex < stallGroups.length
    ) {
      setActiveStallIndex(closestIndex);
    }
  };

  const scrollToIndex = (index) => {
    if (index < 0 || index >= stallGroups.length) return;
    setActiveStallIndex(index);
    if (carouselRef.current) {
      const container = carouselRef.current;
      const slides = container.children;
      if (slides && slides[index]) {
        const slide = slides[index];
        const targetScroll =
          slide.offsetLeft - (container.clientWidth - slide.offsetWidth) / 2;
        container.scrollTo({
          left: targetScroll,
          behavior: "smooth",
        });
      }
    }
  };

  if (!orderDetails || orderDetails.payment_status === "PENDING") {
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
            Payment Processing...
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
            Please wait, your payment is in processing. We are confirming your payment...
          </p>
        </div>
      </div>
    );
  }

  if (orderDetails.payment_status === "FAILED") {
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
          <div style={{ fontSize: "48px", color: "#ef4444", marginBottom: "16px" }}>❌</div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
            Payment Failed
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
            Your payment could not be completed.
          </p>
          <button
            onClick={() => navigate("/stalls")}
            style={{
              padding: "12px 24px",
              background: "#eb4d26",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Back to Stalls
          </button>
        </div>
      </div>
    );
  }

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
        {view === "receipt" && (
          <div className="tokens-carousel-container">
            {/* Multi-Outlet Carousel Header */}
            {stallGroups.length > 1 && (
              <div className="token-carousel-header">
                <span className="multi-token-badge">
                  🎟 {stallGroups.length} Outlets Ordered
                </span>
                <div className="carousel-nav-arrows">
                  <button
                    className="carousel-arrow-btn"
                    onClick={() => scrollToIndex(activeStallIndex - 1)}
                    disabled={activeStallIndex === 0}
                    aria-label="Previous Outlet"
                  >
                    ‹
                  </button>
                  <span className="carousel-counter-text">
                    {activeStallIndex + 1} of {stallGroups.length}
                  </span>
                  <button
                    className="carousel-arrow-btn"
                    onClick={() => scrollToIndex(activeStallIndex + 1)}
                    disabled={activeStallIndex === stallGroups.length - 1}
                    aria-label="Next Outlet"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}

            {/* Swipe Instruction Hint */}
            {stallGroups.length > 1 && (
              <div className="swipe-hint-pill">
                <span className="swipe-hand-icon">👈</span>
                <span>Swipe cards to view each outlet token</span>
                <span className="swipe-hand-icon">👉</span>
              </div>
            )}

            {/* Horizontal Sliding / Scrolling Track */}
            <div
              className={`tokens-scroll-track ${
                stallGroups.length > 1 ? "deck-nudge-anim" : ""
              }`}
              ref={carouselRef}
              onScroll={handleScroll}
            >
              {stallGroups.map((group, idx) => (
                <div
                  key={idx}
                  className={`token-card-slide ${
                    idx === activeStallIndex ? "active-slide" : "inactive-slide"
                  }`}
                  onClick={() => {
                    if (idx !== activeStallIndex) scrollToIndex(idx);
                  }}
                >
                  <div
                    className="receipt-card compact-token"
                    ref={idx === activeStallIndex ? receiptRef : null}
                  >
                    {stallGroups.length > 1 && (
                      <div className="slide-badge-top">
                        Outlet {idx + 1} of {stallGroups.length}
                      </div>
                    )}

                    <h2 className="stall-name">{group.stall_name}</h2>

                    <div className="token-hero-badge">
                      <span className="token-hero-label">YOUR TOKEN NUMBER</span>
                      <h3 className="token-hero-number">{group.token_number}</h3>
                      <div
                        style={{
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
                          gap: "5px",
                        }}
                      >
                        ⏱ Valid for 30 minutes only
                      </div>
                    </div>

                    <p className="order-date">GSTIN: 36AAVFN1793L1ZE</p>
                    <p className="order-date">Date: {createdAt}</p>

                    <hr className="separator" />

                    <div className="token-table">
                      <div className="token-header">
                        <span>Item</span>
                        <span>Rs</span>
                      </div>

                      {group.order_details.map((item, itemIdx) => (
                        <div key={itemIdx} className="token-row">
                          <span className="item-name">
                            {item.name} × {item.quantity}
                          </span>
                          <span>{(item.price || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="token-summary">
                      <p>
                        <span>CGST</span>
                        <span>{(group.cgst || 0).toFixed(2)}</span>
                      </p>
                      <p>
                        <span>SGST</span>
                        <span>{(group.sgst || 0).toFixed(2)}</span>
                      </p>
                      <p>
                        <span>Total GST</span>
                        <span>{(group.total_gst || 0).toFixed(2)}</span>
                      </p>
                      <p>
                        <span>Total</span>
                        <span>{(group.total || group.total_amount || 0).toFixed(2)}</span>
                      </p>
                      <p>
                        <span>Round Off</span>
                        <span>{(group.round_off || 0).toFixed(2)}</span>
                      </p>
                      <hr className="separator" />
                      <p className="grand-total">
                        <span>{stallGroups.length > 1 ? "Outlet Total" : "Grand Total"}</span>
                        <span>₹ {(group.total_amount || 0).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Outlet Selector Pills */}
            {stallGroups.length > 1 && (
              <div className="carousel-dots-row">
                {stallGroups.map((group, idx) => (
                  <button
                    key={idx}
                    className={`carousel-dot-pill ${
                      idx === activeStallIndex ? "active" : ""
                    }`}
                    onClick={() => scrollToIndex(idx)}
                  >
                    {group.stall_name} ({group.token_number})
                  </button>
                ))}
              </div>
            )}

            <button className="download-btn" onClick={downloadPDF}>
              Download Receipt
            </button>
          </div>
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

      {showCoinPopup && (
        <CoinEarnedPopup
          coinsEarned={coinsEarned}
          newBalance={mockNewBalance}
          onClose={() => setShowCoinPopup(false)}
        />
      )}
    </div>
  );
}
