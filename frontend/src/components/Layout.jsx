// frontend/src/components/Layout.jsx
// ═════════════════════════════════════════════════════════════
//  FIXED: Ticker positioned below navbar + AuthWrap updated
// ═════════════════════════════════════════════════════════════

import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Add this import

/* ── Announcement ticker ────────────────────────────── */
export const Ticker = () => {
  const items = [
    "✦ Free Shipping on Orders Over $200",
    "✦ New SS26 Collection Now Live",
    "✦ Complimentary Returns Within 30 Days",
    "✦ Exclusive Members: Early Access to Sales",
    "✦ Ethically Sourced · Sustainably Made",
  ];
  const line = items.join("    ") + "    ";

  return (
    <div
      style={{
        position: "fixed", // ✅ CHANGED: Fixed position
        top: 72, // ✅ CHANGED: Below navbar (navbar height = 72px)
        left: 0,
        right: 0,
        zIndex: 999, // ✅ CHANGED: Below navbar (navbar = 1000)
        background: "var(--gold)",
        padding: "9px 0",
        overflow: "hidden",
      }}
    >
      <div className="marquee-wrap">
        <div className="marquee-inner">
          {[line, line].map((l, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "#0d0b0a",
                fontWeight: 500,
                paddingRight: 40,
              }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Auth split-screen wrapper ──────────────────────── */
export const AuthWrap = ({ title, subtitle, children }) => {
  const navigate = useNavigate(); // ✅ CHANGED: Use navigate instead of setPage

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
      className="grid-1-mobile"
    >
      {/* Left — decorative panel */}
      <div
        style={{
          background: "var(--surface)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
          overflow: "hidden",
          position: "relative",
        }}
        className="hide-mobile"
      >
        {/* Gradient orbs */}
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,168,76,.15) 0%, transparent 70%)",
              top: "-20%",
              left: "-10%",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(107,45,78,.18) 0%, transparent 70%)",
              bottom: "-10%",
              right: "-5%",
              animation: "pulse 5s ease infinite",
            }}
          />
          {/* Diagonal lines */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.06,
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={i}
                x1={`${i * 5.5}%`}
                y1="0"
                x2={`${i * 5.5 + 30}%`}
                y2="100%"
                stroke="var(--gold)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          <button
            onClick={() => navigate("/")} // ✅ CHANGED: navigate("/") instead of setPage("home")
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "block",
              margin: "0 auto 12px",
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
              }}
            >
              MAISON<span className="gold-text">·ÉLITE</span>
            </span>
          </button>

          <p
            style={{
              fontSize: 10,
              letterSpacing: ".3em",
              color: "var(--dim)",
              textTransform: "uppercase",
              marginBottom: 60,
            }}
          >
            Fashion House
          </p>

          <div
            style={{
              width: 1,
              height: 60,
              background:
                "linear-gradient(180deg, var(--gold) 0%, transparent 100%)",
              margin: "0 auto 40px",
            }}
          />

          <blockquote
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: 22,
              color: "var(--muted)",
              lineHeight: 1.65,
              marginBottom: 24,
            }}
          >
            "Elegance is not about being noticed, it's about being remembered."
          </blockquote>
          <p
            style={{
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--gold)",
            }}
          >
            — Giorgio Armani
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              marginTop: 60,
            }}
          >
            {[
              ["12K+", "Members"],
              ["280+", "New Pieces"],
              ["30", "Countries"],
            ].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>
                  {n}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    letterSpacing: ".15em",
                    color: "var(--dim)",
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div
        style={{
          background: "var(--void)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px clamp(24px, 8vw, 100px)",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 300,
              marginBottom: 8,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 13,
              marginBottom: 40,
              letterSpacing: ".04em",
            }}
          >
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
};