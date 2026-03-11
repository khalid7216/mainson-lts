// frontend/src/pages/CartPage.jsx
// ═════════════════════════════════════════════════════════════
//  FIXED: Using navigate instead of setPage
// ═════════════════════════════════════════════════════════════

import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Btn, StatusTag } from "../components/UI";

const CartPage = ({ cart, setCart, navigate }) => {
  const toast = useToast();

  const updateQty = (id, delta) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );

  const remove = (id, name) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    toast(`${name} removed from cart`, "info");
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 200 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "120px 32px 80px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 42,
            fontWeight: 300,
            marginBottom: 12,
          }}
        >
          Shopping Bag
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          {cart.reduce((s, i) => s + i.qty, 0)} items · {cart.length} pieces
        </p>
      </div>

      {/* Empty state */}
      {cart.length === 0 ? (
        <div
          className="fu"
          style={{ textAlign: "center", padding: "100px 0" }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "var(--lift)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              fontSize: 48,
            }}
          >
            🛍️
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 300,
              marginBottom: 12,
            }}
          >
            Your Bag is Empty
          </h2>
          <p
            style={{
              color: "var(--muted)",
              marginBottom: 32,
              fontSize: 14,
            }}
          >
            Discover our curated collection of timeless pieces
          </p>
          <Btn v="primary" size="lg" onClick={() => navigate("/")}>
            Explore Collection
          </Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 48 }} className="grid-1-mobile">
          {/* Cart items */}
          <div>
            {cart.map((item, i) => (
              <div
                key={item.id}
                className="fu"
                style={{
                  display: "flex",
                  gap: 22,
                  padding: "24px 0",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                  animationDelay: `${i * 0.07}s`,
                  animationFillMode: "both",
                  opacity: 0,
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 96,
                    height: 114,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "var(--lift)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      marginBottom: 5,
                    }}
                  >
                    {item.cat}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 17,
                      fontWeight: 300,
                      marginBottom: 6,
                    }}
                  >
                    {item.name}
                  </h3>
                  <p style={{ color: "var(--dim)", fontSize: 12 }}>
                    Size: M · Classic
                  </p>
                </div>

                {/* Quantity controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    disabled={item.qty === 1}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: "1px solid var(--border2)",
                      background: "none",
                      color: "var(--text)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      transition: "all .2s",
                      opacity: item.qty === 1 ? 0.3 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (item.qty > 1) e.target.style.background = "var(--lift)";
                    }}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      minWidth: 24,
                      textAlign: "center",
                    }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: "1px solid var(--border2)",
                      background: "none",
                      color: "var(--text)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "var(--lift)")}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    +
                  </button>
                </div>

                {/* Price & remove */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--gold2)",
                    }}
                  >
                    ${item.price * item.qty}
                  </p>
                  <button
                    onClick={() => remove(item.id, item.name)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--rose)",
                      fontSize: 11,
                      cursor: "pointer",
                      textDecoration: "underline",
                      transition: "opacity .2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                    onMouseLeave={(e) => (e.target.style.opacity = "1")}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div style={{ position: "sticky", top: 120 }}>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 32,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Order Summary
              </h3>

              {/* Subtotal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 14, color: "var(--muted)" }}>
                  Subtotal
                </span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  ${subtotal}
                </span>
              </div>

              {/* Shipping */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 14, color: "var(--muted)" }}>
                  Shipping
                </span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {shipping === 0 ? (
                    <span style={{ color: "var(--emerald)" }}>Free</span>
                  ) : (
                    `$${shipping}`
                  )}
                </span>
              </div>

              {/* Free shipping banner */}
              {subtotal < 200 && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(201,168,76,.08)",
                    border: "1px solid rgba(201,168,76,.2)",
                    borderRadius: 8,
                    marginBottom: 24,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--gold2)",
                      lineHeight: 1.6,
                    }}
                  >
                    Add ${200 - subtotal} more for free shipping
                  </p>
                </div>
              )}

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 20,
                  borderTop: "1px solid var(--border)",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600 }}>Total</span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--gold2)",
                  }}
                >
                  ${total}
                </span>
              </div>

              {/* Checkout button */}
              <Btn v="primary" full size="lg" style={{ marginBottom: 12 }}>
                Proceed to Checkout
              </Btn>

              <button
                onClick={() => navigate("/")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "none",
                  border: "1px solid var(--border2)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--lift)";
                  e.target.style.borderColor = "var(--border)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                  e.target.style.borderColor = "var(--border2)";
                }}
              >
                Continue Shopping
              </button>

              {/* Trust badges */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, color: "var(--dim)", lineHeight: 1.8 }}>
                  ✓ Secure checkout
                  <br />
                  ✓ Free returns within 30 days
                  <br />✓ Complimentary gift wrapping
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;