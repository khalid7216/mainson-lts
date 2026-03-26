// frontend/src/pages/CheckoutPage.jsx
import { useState, useRef, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { orderAPI, paymentAPI } from "../services/api";
import { Btn } from "../components/UI";
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle, IoWalletOutline } from "react-icons/io5";

const CARD_STYLE = {
  style: {
    base: {
      fontSize: "16px",
      color: "#e8e0d0",
      fontFamily: "'Inter', sans-serif",
      "::placeholder": { color: "#6b6557" },
    },
    invalid: { color: "#c0392b" },
  },
};

const CheckoutPage = ({ cart, setCart, navigate }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const { user }   = useAuth();
  const toast    = useToast();

  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState("form"); // form | success | error
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card"); // card | cod

  // Ref to track a pending order so we can rollback if user leaves
  const pendingOrderId = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "https://maison-backend.vercel.app/api";

  /* ── Rollback on page refresh / tab close ──────── */
  useEffect(() => {
    const sendRollback = () => {
      if (!pendingOrderId.current) return;
      const token  = localStorage.getItem("token");
      const orderId = pendingOrderId.current;
      pendingOrderId.current = null; // prevent double-fire

      // fetch with keepalive:true survives page unload AND can set Auth headers
      fetch(`${API_URL}/orders/${orderId}/rollback`, {
        method:    "POST",
        keepalive: true,                   // ← key: outlives the page
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: "{}",
      }).catch(() => {}); // silently ignore network errors
    };

    // beforeunload  → refresh, close tab, navigate away
    // pagehide      → back/forward cache, mobile browser suspend
    window.addEventListener("beforeunload", sendRollback);
    window.addEventListener("pagehide",     sendRollback);

    return () => {
      window.removeEventListener("beforeunload", sendRollback);
      window.removeEventListener("pagehide",     sendRollback);
    };
  }, [API_URL]);

  // Shipping State
  const [address, setAddress] = useState({
    fullName:   user?.name || "",
    line1:      "",
    city:       "",
    postalCode: "",
    country:    "Pakistan", // Default country
  });

  const subtotal     = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax          = Math.round(subtotal * 0.08 * 100) / 100;
  const shippingCost = subtotal > 200 ? 0 : 15;
  const total        = Math.round((subtotal + tax + shippingCost) * 100) / 100;

  if (!user) {
    return (
      <div style={{ padding: "140px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 16 }}>
          Please Sign In
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>You need to be logged in to checkout.</p>
        <Btn v="primary" onClick={() => navigate("/login")}>Sign In</Btn>
      </div>
    );
  }

  if (cart.length === 0 && step === "form") {
    return (
      <div style={{ padding: "140px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 16 }}>
          Your Cart is Empty
        </h2>
        <Btn v="primary" onClick={() => navigate("/")}>Browse Collection</Btn>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (paymentMethod === "card" && (!stripe || !elements)) return;

    setLoading(true);
    setErrorMsg("");

    try {
      /* ── 1. Create order (server fetches real prices) ── */
      const cartItems = cart.map((item) => ({
        productId: item._id || item.id,
        qty:       item.qty,
      }));

      const { order } = await orderAPI.createOrder({
        cartItems,
        shippingAddress: address,
        notes: paymentMethod === "cod" ? "Cash on Delivery" : "",
      });

      // Track pending order — rollback fires if user leaves now
      pendingOrderId.current = order._id;

      /* ── 2. Handle Payment Method ──────────────────── */
      if (paymentMethod === "card") {
        const { clientSecret } = await paymentAPI.createIntent(order._id);

        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name: user.name, email: user.email },
          },
        });

        if (error) {
          // Stripe error (declined, etc.) — rollback since the order won't be completed in this session
          await orderAPI.rollbackOrder(order._id).catch(() => {});
          pendingOrderId.current = null;
          
          setErrorMsg(error.message);
          setStep("error");
          setOrderResult(order);
          toast(error.message, "err");
          return;
        }

        /* ── 3. Verify payment from DB (authoritative) ── */
        const verification = await paymentAPI.verifyPayment(order._id);

        if (verification.verified) {
          // Payment confirmed by DB — clear pending ref so rollback won't fire
          pendingOrderId.current = null;
          setOrderResult(order);
          setStep("success");
          setCart([]);
          toast("Payment successful! 🎉", "ok");
        } else {
          // Verification failed at DB/Stripe level — rollback to be safe
          await orderAPI.rollbackOrder(order._id).catch(() => {});
          pendingOrderId.current = null;
          
          setErrorMsg(`Payment could not be verified (status: ${verification.status}). Order has been cancelled.`);
          setStep("error");
          setOrderResult(order);
          toast("Payment verification failed", "err");
        }
      } else {
        // Cash on Delivery — terminal success
        pendingOrderId.current = null;
        setOrderResult(order);
        setStep("success");
        setCart([]);
        toast("Order placed successfully! (Cash on Delivery)", "ok");
      }
    } catch (err) {
      if (pendingOrderId.current) {
        await orderAPI.rollbackOrder(pendingOrderId.current).catch(() => {});
        pendingOrderId.current = null;
      }
      setErrorMsg(err.message || "An unexpected error occurred during checkout.");
      setStep("error");
      toast(err.message, "err");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success Screen ──────────────────────────────── */
  if (step === "success") {
    return (
      <div style={{ padding: "140px 32px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <IoCheckmarkCircle size={72} color="var(--emerald)" style={{ marginBottom: 24 }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 300, marginBottom: 12 }}>
          Order Confirmed
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 8 }}>
          Order <strong style={{ color: "var(--gold2)" }}>{orderResult?.orderId || `#ME-${orderResult?._id?.slice(-6).toUpperCase()}`}</strong> has been placed.
        </p>
        <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 40 }}>
          {paymentMethod === 'cod' 
            ? "You will pay in cash when your order is delivered."
            : "You'll receive an email confirmation shortly."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn v="primary" onClick={() => navigate("/profile")}>View Orders</Btn>
          <Btn v="ghost" onClick={() => navigate("/")}>Continue Shopping</Btn>
        </div>
      </div>
    );
  }

  /* ── Error Screen ────────────────────────────────── */
  if (step === "error") {
    return (
      <div style={{ padding: "140px 32px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <IoCloseCircle size={72} color="var(--rose)" style={{ marginBottom: 24 }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 300, marginBottom: 12 }}>
          Payment Failed
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>
          {errorMsg || "Something went wrong with your payment."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn v="primary" onClick={() => setStep("form")}>Try Again</Btn>
          <Btn v="ghost" onClick={() => navigate("/cart")}>Back to Cart</Btn>
        </div>
      </div>
    );
  }

  /* ── Checkout Form ───────────────────────────────── */
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(80px, 12vh, 120px) 32px 80px" }}>
      {/* Back */}
      <button
        onClick={() => navigate("/cart")}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", color: "var(--muted)",
          fontSize: 13, cursor: "pointer", marginBottom: 32,
        }}
      >
        <IoArrowBack size={16} /> Back to Cart
      </button>

      <h1 style={{
        fontFamily: "'Playfair Display', serif", fontSize: 36,
        fontWeight: 300, marginBottom: 40,
      }}>
        Checkout
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 48 }} className="grid-1-mobile">
        {/* Left — Shipping & Payment Form */}
        <div>
          <form onSubmit={handleCheckout}>
            {/* 1. Shipping Address */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "clamp(24px, 5vw, 32px)", marginBottom: 24,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 24 }}>
                Shipping Address
              </h3>
              
              <div style={{ display: "grid", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Full Name</label>
                  <input 
                    type="text" required className="inp" placeholder="Jane Doe"
                    value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Street Address</label>
                  <input 
                    type="text" required className="inp" placeholder="123 Maison St"
                    value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>City</label>
                    <input 
                      type="text" required className="inp" placeholder="New York"
                      value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Postal Code</label>
                    <input 
                      type="text" required className="inp" placeholder="10001"
                      value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "clamp(24px, 5vw, 32px)", marginBottom: 24,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <IoWalletOutline size={18} color="var(--text)" /> Payment Method
              </h3>

              <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 8,
                    border: `1px solid ${paymentMethod === "card" ? "var(--gold)" : "var(--border2)"}`,
                    background: paymentMethod === "card" ? "rgba(201,168,76,.08)" : "var(--lift)",
                    color: paymentMethod === "card" ? "var(--text)" : "var(--muted)",
                    fontWeight: paymentMethod === "card" ? 500 : 400,
                    cursor: "pointer", transition: "all .2s"
                  }}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 8,
                    border: `1px solid ${paymentMethod === "cod" ? "var(--gold)" : "var(--border2)"}`,
                    background: paymentMethod === "cod" ? "rgba(201,168,76,.08)" : "var(--lift)",
                    color: paymentMethod === "cod" ? "var(--text)" : "var(--muted)",
                    fontWeight: paymentMethod === "cod" ? 500 : 400,
                    cursor: "pointer", transition: "all .2s"
                  }}
                >
                  Cash on Delivery
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === "card" && (
                <>
                  <div style={{
                    padding: "16px 14px", borderRadius: 8,
                    border: "1px solid var(--border2)", background: "var(--lift)",
                  }}>
                    <CardElement options={CARD_STYLE} />
                  </div>
                  <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 12 }}>
                    Your card info is secured by Stripe. We never store your card details.
                  </p>
                  
                  {/* Test hint */}
                  <div style={{
                    padding: "14px 18px", borderRadius: 8,
                    background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.15)",
                    marginTop: 24,
                  }}>
                    <p style={{ fontSize: 12, color: "var(--gold2)", lineHeight: 1.6 }}>
                      🧪 <strong>Test mode</strong> — Use card <code style={{ background: "var(--lift)", padding: "2px 6px", borderRadius: 4 }}>4242 4242 4242 4242</code>, any future date, any CVC.
                    </p>
                  </div>
                </>
              )}

              {/* COD Info */}
              {paymentMethod === "cod" && (
                <div style={{
                  padding: "16px 20px", borderRadius: 8,
                  background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.15)",
                }}>
                  <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                    You will pay in cash when the order is delivered to your shipping address. 
                    Please ensure you have the exact amount ready.
                  </p>
                </div>
              )}
            </div>

            <Btn v="primary" full size="lg" type="submit" disabled={loading || (paymentMethod === "card" && !stripe)}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 1s linear infinite", display: "inline-block",
                  }} />
                  Processing...
                </span>
              ) : (
                paymentMethod === 'cod' ? `Confirm Order $${total.toFixed(2)}` : `Pay $${total.toFixed(2)}`
              )}
            </Btn>
          </form>
        </div>

        {/* Right — Order Summary */}
        <div>
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 28, position: "sticky", top: 120,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              Order Summary
            </h3>

            {/* Items */}
            <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8, marginBottom: 16 }}>
              {cart.map((item) => (
                <div key={item.id} style={{
                  display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16,
                  borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: 56, height: 68, borderRadius: 6, overflow: "hidden",
                    background: "var(--lift)", flexShrink: 0,
                  }}>
                    <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "var(--dim)" }}>Qty: {item.qty}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gold2)" }}>
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Subtotal</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Tax (8%)</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Shipping</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {shippingCost === 0 ? <span style={{ color: "var(--emerald)" }}>Free</span> : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              paddingTop: 16, borderTop: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "var(--gold2)" }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
