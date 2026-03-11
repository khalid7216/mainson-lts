import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar, Btn, Tag, StatusTag } from "../components/UI";
import { ORDERS } from "../data/mockData";

const ProfilePage = ({ setPage }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState("orders");

  /* Redirect if not logged in */
  if (!user) {
    setPage("login");
    return null;
  }

  const TABS = [
    { id: "orders",    icon: "📦", label: "Orders" },
    { id: "wishlist",  icon: "♡",  label: "Wishlist" },
    { id: "addresses", icon: "◎",  label: "Addresses" },
    { id: "payment",   icon: "💳", label: "Payment" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 48 }} className="grid-1-mobile">

        {/* ── Sidebar ─────────────────────────────── */}
        <div>
          {/* Profile card */}
          <div
            style={{
              textAlign: "center", padding: "28px 20px",
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <Avatar name={user.name} size={64} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginTop: 14, marginBottom: 4 }}>
              {user.name}
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>{user.email}</p>
            {user.isAdmin && (
              <div style={{ marginTop: 10 }}>
                <Tag color="gold">Admin</Tag>
              </div>
            )}
          </div>

          {/* Tab list */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`side-btn${tab === t.id ? " active" : ""}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ──────────────────────────────── */}
        <div className="fu">
          <h1 className="section-title" style={{ textTransform: "capitalize" }}>
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
          <p className="section-sub">
            {tab === "orders"
              ? `${ORDERS.length} total orders`
              : `Manage your ${tab}`}
          </p>

          {/* Orders list */}
          {tab === "orders" &&
            ORDERS.map((o, i) => (
              <div
                key={o.id}
                className="fu"
                style={{
                  padding: 24, background: "var(--card)",
                  border: "1px solid var(--border)", borderRadius: 10,
                  marginBottom: 14,
                  animationDelay: `${i * 0.06}s`,
                  animationFillMode: "both", opacity: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gold2)" }}>{o.id}</p>
                    <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>
                      {o.date} · {o.items} items
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 300 }}>
                      ${o.total}
                    </p>
                    <div style={{ marginTop: 6 }}>
                      <StatusTag status={o.status} />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
                  <Btn v="ghost" size="sm">View Details</Btn>
                  {o.status === "Delivered" && <Btn v="ghost" size="sm">Buy Again</Btn>}
                </div>
              </div>
            ))}

          {/* Empty states */}
          {tab !== "orders" && (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <p style={{ fontSize: 36, marginBottom: 16, opacity: .3 }}>
                {TABS.find((t) => t.id === tab)?.icon}
              </p>
              <p style={{ color: "var(--muted)", marginBottom: 24 }}>
                No {tab} saved yet
              </p>
              {tab === "wishlist" ? (
                <Btn v="primary" onClick={() => setPage("home")}>Browse Collection</Btn>
              ) : (
                <Btn v="ghost">+ Add {tab === "addresses" ? "Address" : "Payment Method"}</Btn>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
