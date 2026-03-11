import React from "react";

/* ── Button ─────────────────────────────────────────── */
export const Btn = ({ children, onClick, v = "primary", size = "md", disabled, full, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-${v} btn-${size}${full ? " btn-fl" : ""}`}
    style={style}
  >
    {children}
  </button>
);

/* ── Input ──────────────────────────────────────────── */
export const Inp = ({ label, type = "text", value, onChange, placeholder, error, icon }) => (
  <div className="inp-wrap">
    {label && <label className="inp-label">{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && (
        <span
          style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--dim)", fontSize: 15, pointerEvents: "none",
          }}
        >
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`inp${icon ? " inp-icon" : ""}`}
        style={{ borderColor: error ? "var(--rose)" : "" }}
      />
    </div>
    {error && <p style={{ color: "var(--rose)", fontSize: 11, marginTop: 5 }}>{error}</p>}
  </div>
);

/* ── Loading spinner ────────────────────────────────── */
export const Spinner = ({ size = 16 }) => (
  <span
    style={{
      width: size, height: size,
      border: `2px solid rgba(0,0,0,.2)`,
      borderTopColor: "#0d0b0a",
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin .7s linear infinite",
      flexShrink: 0,
    }}
  />
);

/* ── Colour tag badge ───────────────────────────────── */
export const Tag = ({ children, color = "gold" }) => {
  const map = {
    gold:    ["rgba(201,168,76,.15)",  "var(--gold2)"],
    ink:     ["rgba(255,255,255,.1)",  "var(--text)"],
    rose:    ["rgba(192,57,43,.2)",    "#e88"],
    emerald: ["rgba(26,122,74,.2)",    "#5d9"],
    violet:  ["rgba(120,80,180,.2)",   "#bb9"],
  };
  const [bg, c] = map[color] || map.gold;
  return (
    <span className="tag" style={{ background: bg, color: c }}>
      {children}
    </span>
  );
};

/* ── Avatar initials ────────────────────────────────── */
export const Avatar = ({ name, size = 36 }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, var(--gold) 0%, #6b3a00 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#0d0b0a", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
    }}
  >
    {name?.charAt(0).toUpperCase()}
  </div>
);

/* ── Order / customer status tag ───────────────────── */
export const StatusTag = ({ status }) => {
  const map = {
    Delivered:  ["var(--emerald)",  "rgba(26,122,74,.15)"],
    Shipped:    ["#5b9dd9",         "rgba(91,157,217,.15)"],
    Processing: ["var(--gold)",     "rgba(201,168,76,.15)"],
    Cancelled:  ["var(--rose)",     "rgba(192,57,43,.15)"],
    Active:     ["var(--emerald)",  "rgba(26,122,74,.15)"],
    VIP:        ["var(--gold)",     "rgba(201,168,76,.15)"],
    Elite:      ["#b47de8",         "rgba(180,125,232,.15)"],
    New:        ["#5b9dd9",         "rgba(91,157,217,.15)"],
    Bestseller: ["var(--gold)",     "rgba(201,168,76,.15)"],
    Sale:       ["var(--rose)",     "rgba(192,57,43,.15)"],
  };
  const [c, bg] = map[status] || ["var(--muted)", "var(--lift)"];
  return (
    <span
      style={{
        fontSize: 10, padding: "4px 10px", borderRadius: 100,
        background: bg, color: c,
        fontWeight: 600, letterSpacing: ".08em",
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};
