import React, { useState } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import { Inp, Btn, StatusTag } from "../components/UI";
import SEO from "../components/SEO";

const TrackOrderPage = () => {
  const [orderQuery, setOrderQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) {
      setError("Please enter your Order ID or Tracking Number.");
      return;
    }
    setError("");
    setLoading(true);
    setOrderData(null);
    try {
      // The API endpoint takes orderId and optionally email
      const data = await orderAPI.trackOrder(orderQuery.trim(), emailQuery.trim());
      setOrderData(data);
    } catch (err) {
      setError(err.message || "Failed to find order. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 90, minHeight: "80vh" }}>
      <SEO pageName="Track Order" />
      <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 300, color: "var(--text)", marginBottom: 12 }}>
            Track Your Order
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Enter your Order ID (e.g., #ME-1234) or courier Tracking Number below to check the real-time status of your delivery.
          </p>
        </div>

        <div style={{ background: "var(--surface)", padding: 32, borderRadius: 12, border: "1px solid var(--border)", marginBottom: 40, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
          <form onSubmit={handleTrackSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="grid-2-col" style={{ gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 8 }}>Order ID or Tracking No <span style={{color: "var(--rose)"}}>*</span></label>
                <input 
                  type="text" 
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="e.g. #ME-9876 or TCS123..."
                  style={{ width: "100%", padding: "14px 18px", borderRadius: 8, border: "1px solid var(--border2)", background: "rgba(255,255,255,0.03)", color: "var(--text)", fontSize: 15, outline: "none" }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 8 }}>Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={emailQuery}
                  onChange={(e) => setEmailQuery(e.target.value)}
                  placeholder="Email used during checkout"
                  style={{ width: "100%", padding: "14px 18px", borderRadius: 8, border: "1px solid var(--border2)", background: "rgba(255,255,255,0.03)", color: "var(--text)", fontSize: 15, outline: "none" }}
                />
              </div>
            </div>
            
            {error && <div style={{ padding: "12px 16px", background: "rgba(224, 108, 117, 0.1)", border: "1px solid rgba(224, 108, 117, 0.3)", color: "var(--rose)", borderRadius: 6, fontSize: 14 }}>? {error}</div>}

            <Btn type="submit" disabled={loading} style={{ alignSelf: "flex-start", minWidth: 200, padding: "16px 24px" }}>
              {loading ? "Locating..." : "Track Package"}
            </Btn>
          </form>
        </div>

        {orderData && (
          <div style={{ animation: "fadeIn 0.5s ease both" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 32 }}>
              
              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, borderBottom: "1px solid var(--border)", paddingBottom: 24, marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 6 }}>Order Reference</p>
                  <h2 style={{ fontSize: 24, fontWeight: 500, color: "var(--text)" }}>{orderData.orderId}</h2>
                  <div style={{ marginTop: 10 }}>
                    <StatusTag status={orderData.status} />
                  </div>
                </div>
                
                <div style={{ textAlign: "right" }}>
                  {orderData.trackingNumber ? (
                    <>
                      <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 6 }}>Tracking Details</p>
                      <p style={{ fontSize: 18, color: "var(--gold2)", fontWeight: 500 }}>{orderData.trackingNumber}</p>
                      <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 4 }}>Via: <span style={{ color: "var(--text)" }}>{orderData.courierName || "Standard Courier"}</span></p>
                    </>
                  ) : (
                    <div style={{ padding: "12px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 8, display: "inline-block" }}>
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>Tracking number not yet generated.</p>
                      <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>Usually updates within 24 hours.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Summary Quick */}
              <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 20, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
                {orderData.items?.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 8, flexShrink: 0, minWidth: 200 }}>
                    <img src={item.image || "https://via.placeholder.com/40"} alt={item.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover", border: "1px solid var(--border)" }} />
                    <div>
                      <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: 120 }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: "var(--dim)" }}>Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline Stepper */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", marginBottom: 24 }}>Tracking History</h3>
                
                {orderData.trackingHistory && orderData.trackingHistory.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginLeft: 16 }}>
                    {orderData.trackingHistory.sort((a,b) => new Date(b.date) - new Date(a.date)).map((hist, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 20, position: "relative" }}>
                        {/* Line */}
                        {idx !== orderData.trackingHistory.length - 1 && (
                          <div style={{ position: "absolute", left: 7, top: 24, bottom: -20, width: 2, background: "var(--border2)" }} />
                        )}
                        
                        {/* Dot */}
                        <div style={{ position: "relative", zIndex: 1, marginTop: 4 }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: idx === 0 ? "var(--gold)" : "var(--lift)", border: `2px solid ${idx === 0 ? "var(--gold2)" : "var(--border2)"}` }} />
                        </div>
                        
                        {/* Content */}
                        <div style={{ paddingBottom: 30 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: idx === 0 ? "var(--text)" : "var(--dim)", textTransform: "capitalize" }}>
                            {hist.status}
                          </p>
                          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0", lineHeight: 1.5 }}>
                            {hist.description || "Status updated"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--dim)", letterSpacing: ".05em" }}>
                            {new Date(hist.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic" }}>
                    No tracking updates available yet. The status will update once your order starts processing.
                  </p>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
