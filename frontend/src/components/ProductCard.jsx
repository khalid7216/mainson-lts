// frontend/src/components/ProductCard.jsx
// ═════════════════════════════════════════════════════════════
//  UPDATED: Changed p.id to p.slug in navigate
// ═════════════════════════════════════════════════════════════

import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Btn, StatusTag } from "./UI";
import { IoCloseOutline, IoStar, IoHeartOutline, IoHeart, IoCheckmarkCircleOutline, IoCarOutline, IoSyncOutline } from "react-icons/io5";

/* ── Quick-View Modal ───────────────────────────────── */
export const QuickView = ({ product: p, onClose, addToCart }) => {
  const toast = useToast();
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(p);
    toast(`${p.name} added to bag`, "ok");
    onClose();
  };

  return (
    <div
      className="modal-bg"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
          className="grid-1-mobile"
        >
          {/* Image panel */}
          <div
            style={{
              height: 520,
              background: "var(--lift)",
              overflow: "hidden",
              borderRadius: "12px 0 0 12px",
              position: "relative",
            }}
          >
            <img
              src={p.image?.url || p.image}
              alt={p.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            {p.badge && (
              <div style={{ position: "absolute", top: 20, left: 20 }}>
                <StatusTag status={p.badge} />
              </div>
            )}
          </div>

          {/* Info panel */}
          <div
            style={{
              padding: "40px 36px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                alignSelf: "flex-end",
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: 26,
                lineHeight: 1,
                marginBottom: 20,
                transition: "color .2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
            >
              <IoCloseOutline size={28} />
            </button>

            <p
              style={{
                fontSize: 10,
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 10,
              }}
            >
              {p.cat}
            </p>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 300,
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              {p.name}
            </h2>

            {/* Stars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 12,
                      color:
                        s <= Math.floor(p.rating) ? "var(--gold)" : "var(--dim)",
                    }}
                  >
                    <IoStar size={12} />
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {p.rating} ({p.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 300,
                }}
              >
                ${p.price}
              </span>
              {p.orig && (
                <>
                  <span
                    style={{
                      fontSize: 18,
                      color: "var(--dim)",
                      textDecoration: "line-through",
                    }}
                  >
                    ${p.orig}
                  </span>
                  <StatusTag status="Sale" />
                </>
              )}
            </div>

            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.85,
                marginBottom: 28,
              }}
            >
              Crafted in our atelier from the finest materials. This piece
              embodies effortless sophistication — designed to transcend seasons.
            </p>

            {/* Size selector */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  Size: {size}
                </span>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold)",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Size Guide →
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 6,
                      border: `1px solid ${
                        size === s ? "var(--gold)" : "var(--border2)"
                      }`,
                      background:
                        size === s ? "rgba(201,168,76,.15)" : "none",
                      color: size === s ? "var(--gold2)" : "var(--muted)",
                      fontSize: 12,
                      transition: "all .2s",
                      cursor: "pointer",
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                Qty
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span
                  style={{
                    fontSize: 16,
                    minWidth: 28,
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {qty}
                </span>
                <button className="qty-btn" onClick={() => setQty((q) => q + 1)}>
                  +
                </button>
              </div>
            </div>

            {/* CTA */}
            <div
              style={{ display: "flex", gap: 12, marginTop: "auto" }}
            >
              <Btn v="primary" full onClick={handleAdd}>
                Add to Bag — ${p.price * qty}
              </Btn>
              <button
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  border: "1px solid var(--border2)",
                  borderRadius: 6,
                  background: "none",
                  color: "var(--muted)",
                  fontSize: 20,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "var(--gold)";
                  e.target.style.color = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "var(--border2)";
                  e.target.style.color = "var(--muted)";
                }}
              >
                <IoHeartOutline size={20} />
              </button>
            </div>

            {/* Trust badges */}
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 20,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
              }}
            >
              {[
                { icon: <IoCarOutline size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />, text: "Free Delivery" },
                { icon: <IoSyncOutline size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />, text: "Free Returns" },
                { icon: <IoCheckmarkCircleOutline size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />, text: "Authentic" }
              ].map((t) => (
                <span key={t.text} style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center" }}>
                  {t.icon} {t.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Product Card ───────────────────────────────────── */
const ProductCard = ({
  product: p,
  navigate,
  addToCart,
  wishlist,
  toggleWishlist,
  onQuickView,
  delay = 0,
}) => {
  const toast = useToast();
  const isWished = wishlist?.includes(p.id);

  return (
    <div
      className="prod-card fu lift"
      onClick={() => navigate(`/product/${p.slug}`)} // ✅ CHANGED: p.id → p.slug
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: "both",
        opacity: 0,
        cursor: "pointer",
      }}
    >
      {/* Image box */}
      <div
        className="prod-img"
        style={{
          height: 340,
          background: "var(--lift)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={p.image?.url || p.image}
          alt={p.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transition: "transform .5s ease",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />

        {/* Badge */}
        {p.badge && (
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <StatusTag status={p.badge} />
          </div>
        )}

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: isWished
              ? "rgba(201,168,76,.3)"
              : "rgba(0,0,0,.5)",
            border: `1px solid ${isWished ? "var(--gold)" : "var(--border)"}`,
            color: isWished ? "var(--gold)" : "var(--muted)",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .25s",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
          }}
        >
          {isWished ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
        </button>

        {/* Hover overlay (Desktop only) */}
        <div className="prod-overlay hide-mobile">
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 6,
                background: "rgba(255,255,255,.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,.15)",
                color: "var(--text)",
                fontSize: 11,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
                transition: "all .2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(255,255,255,.18)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "rgba(255,255,255,.1)")
              }
            >
              Quick View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(p);
                toast(`${p.name} added!`, "ok");
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 6,
                background: "var(--gold)",
                border: "none",
                color: "#0d0b0a",
                fontSize: 11,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "var(--gold2)")}
              onMouseLeave={(e) => (e.target.style.background = "var(--gold)")}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div style={{ padding: "18px 4px 8px" }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 7,
          }}
        >
          {p.cat}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 300,
              color: "var(--text)",
              lineHeight: 1.2,
              flex: 1,
              paddingRight: 12,
            }}
          >
            {p.name}
          </h3>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>${p.price}</span>
            {p.orig && (
              <span
                style={{
                  fontSize: 13,
                  color: "var(--dim)",
                  textDecoration: "line-through",
                  marginLeft: 6,
                }}
              >
                ${p.orig}
              </span>
            )}
          </div>
        </div>
        
        {/* Mobile quick action */}
        <div className="mobile-only" style={{ marginTop: 12 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(p);
              toast(`${p.name} added!`, "ok");
            }}
            style={{ width: "100%", padding: "8px 0", background: "var(--gold)", border: "none", borderRadius: 4, color: "#0d0b0a", fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: ".1em" }}
          >
            Add to Bag
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          <span style={{ color: "var(--gold)", fontSize: 11, display: "flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <IoStar key={i} size={11} color={i < Math.floor(p.rating) ? "var(--gold)" : "var(--dim)"} />
            ))}
          </span>
          <span style={{ fontSize: 11, color: "var(--dim)" }}>
            ({p.reviews})
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;