import { useState } from "react";
import { Avatar, Btn, StatusTag } from "../../components/UI";
import { PRODUCTS, ORDERS, CUSTOMERS, REV_DATA, REV_LABELS } from "../../data/mockData";
import ProductFormModal from "./ProductFormModal";

/* ── Reusable Stat card ─────────────────────────────── */
export const StatCard = ({ icon, label, value, delta, sub }) => (
  <div className="stat-card">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
          {label}
        </p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 300 }}>
          {value}
        </p>
        {delta && (
          <p style={{ fontSize: 12, color: delta.startsWith("+") ? "var(--emerald)" : "var(--rose)", marginTop: 8 }}>
            {delta} <span style={{ color: "var(--dim)" }}>vs last month</span>
          </p>
        )}
        {sub && <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 6 }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 26 }}>{icon}</span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════ */
export const AdminDashboard = () => (
  <div className="fu">
    <div style={{ marginBottom: 32 }}>
      <h1 className="section-title" style={{ fontSize: 36 }}>Dashboard</h1>
      <p className="section-sub">February 17, 2026 · Season average up 24%</p>
    </div>

    {/* Stats row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
      <StatCard icon="💰" label="Revenue (Feb)" value="$48,290" delta="+18.4%" />
      <StatCard icon="🛍" label="Orders"        value="284"     delta="+7.2%"  />
      <StatCard icon="👥" label="Customers"     value="1,842"   delta="+12.1%" />
      <StatCard icon="♡"  label="Wishlist"      value="4,218"   sub="Conversion 14.2%" />
    </div>

    {/* Recent orders + Top sellers */}
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
      {/* Recent orders */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Recent Orders</h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>Order</th><th>Customer</th><th>Total</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.slice(0, 5).map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600, fontSize: 12, color: "var(--gold2)" }}>{o.id}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={o.avatar} size={26} />
                    <span>{o.customer}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>${o.total}</td>
                <td><StatusTag status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top sellers */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Top Sellers</h3>
        {PRODUCTS.slice(0, 5).map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: "var(--dim)", width: 16 }}>#{i + 1}</span>
            <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: "var(--lift)", border: "1px solid var(--border)", flexShrink: 0 }}>
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                <div style={{ height: 3, width: `${p.reviews * 0.8}%`, maxWidth: "80%", background: "var(--gold)", borderRadius: 2, opacity: .6 }} />
                <span style={{ fontSize: 10, color: "var(--dim)" }}>{p.reviews} sold</span>
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold2)" }}>${p.price}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════════════════ */
export const AdminProducts = () => {
  const [query,   setQuery]   = useState("");
  const [modal,   setModal]   = useState(null); // null | "add" | product object (edit)
  const [allProds, setAllProds] = useState(PRODUCTS);

  const items = allProds.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleSave = (saved) => {
    setAllProds((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      return exists ? prev.map((p) => p.id === saved.id ? { ...p, ...saved, cat: saved.category } : p)
                    : [...prev, { ...saved, cat: saved.category }];
    });
  };

  return (
    <div className="fu">
      {modal && (
        <ProductFormModal
          product={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="section-title">Products</h1>
          <p className="section-sub">{allProds.length} items in catalogue</p>
        </div>
        <Btn v="primary" onClick={() => setModal("add")}>+ Add Product</Btn>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            style={{ flex: 1, maxWidth: 320, padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "var(--lift)", color: "var(--text)", fontSize: 13 }}
          />
          <select style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "var(--lift)", color: "var(--text)", fontSize: 12 }}>
            {["All Categories", "Dresses", "Outerwear", "Tops", "Bottoms", "Shoes", "Accessories"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <table className="tbl">
          <thead>
            <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td style={{ width: 60, padding: "10px" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 6, overflow: "hidden", background: "var(--lift)", border: "1px solid var(--border)" }}>
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: "var(--muted)" }}>{p.cat}</td>
                <td>
                  <span style={{ color: "var(--gold2)", fontWeight: 600 }}>${p.price}</span>
                  {p.orig && (
                    <span style={{ fontSize: 11, color: "var(--dim)", textDecoration: "line-through", marginLeft: 6 }}>
                      ${p.orig}
                    </span>
                  )}
                </td>
                <td>
                  <span style={{ color: "var(--gold)", fontSize: 12 }}>★</span> {p.rating}
                </td>
                <td>
                  {p.badge ? <StatusTag status={p.badge} /> : <span style={{ color: "var(--dim)", fontSize: 12 }}>—</span>}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setModal(p)}
                      style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: "pointer", fontSize: 11, fontFamily: "'Jost', sans-serif", transition: "all .2s" }}
                      onMouseEnter={(e) => (e.target.style.borderColor = "var(--gold)")}
                      onMouseLeave={(e) => (e.target.style.borderColor = "var(--border2)")}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setAllProds((prev) => prev.filter((x) => x.id !== p.id))}
                      style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(192,57,43,.3)", background: "none", color: "var(--rose)", cursor: "pointer", fontSize: 11, fontFamily: "'Jost', sans-serif" }}>
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   ORDERS
═══════════════════════════════════════════════════ */
export const AdminOrders = () => {
  const [filter, setFilter] = useState("All");
  const FILTERS = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
  const items = filter === "All" ? ORDERS : ORDERS.filter((o) => o.status === filter);

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="section-title">Orders</h1>
          <p className="section-sub">{ORDERS.length} total orders this month</p>
        </div>
        <Btn v="ghost">↓ Export CSV</Btn>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 18px", borderRadius: 100,
              border: `1px solid ${filter === f ? "var(--gold)" : "var(--border)"}`,
              background: filter === f ? "rgba(201,168,76,.12)" : "none",
              color: filter === f ? "var(--gold2)" : "var(--muted)",
              cursor: "pointer", fontSize: 11, letterSpacing: ".08em",
              fontFamily: "'Jost', sans-serif", transition: "all .2s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
        <table className="tbl">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700, color: "var(--gold2)", fontSize: 12 }}>{o.id}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={o.avatar} size={30} />
                    {o.customer}
                  </div>
                </td>
                <td style={{ color: "var(--muted)" }}>{o.date}</td>
                <td>{o.items}</td>
                <td style={{ fontWeight: 700, fontSize: 14 }}>${o.total}</td>
                <td><StatusTag status={o.status} /></td>
                <td>
                  <button
                    style={{ padding: "5px 14px", borderRadius: 5, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: "pointer", fontSize: 11, fontFamily: "'Jost', sans-serif", transition: "all .2s" }}
                    onMouseEnter={(e) => (e.target.style.borderColor = "var(--gold)")}
                    onMouseLeave={(e) => (e.target.style.borderColor = "var(--border2)")}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CUSTOMERS
═══════════════════════════════════════════════════ */
export const AdminCustomers = () => (
  <div className="fu">
    <div style={{ marginBottom: 28 }}>
      <h1 className="section-title">Customers</h1>
      <p className="section-sub">{CUSTOMERS.length} registered members</p>
    </div>

    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
      <table className="tbl">
        <thead>
          <tr><th>Customer</th><th>Email</th><th>Joined</th><th>Orders</th><th>Total Spent</th><th>Tier</th></tr>
        </thead>
        <tbody>
          {CUSTOMERS.map((c) => (
            <tr key={c.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={c.name} size={34} />
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                </div>
              </td>
              <td style={{ color: "var(--muted)" }}>{c.email}</td>
              <td style={{ color: "var(--muted)" }}>{c.joined}</td>
              <td style={{ fontWeight: 600 }}>{c.orders}</td>
              <td style={{ fontWeight: 700, color: "var(--gold2)" }}>${c.spent.toLocaleString()}</td>
              <td><StatusTag status={c.tier} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════════════════ */
export const AdminAnalytics = () => {
  const maxRev = Math.max(...REV_DATA);
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className="fu">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">Analytics</h1>
        <p className="section-sub">Performance overview · Last 6 months</p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 28 }}>
        <StatCard icon="💰" label="Total Revenue" value="$263,090" delta="+24.3%" />
        <StatCard icon="🛍" label="Total Orders"  value="1,847"    delta="+15.2%" />
        <StatCard icon="◎"  label="Avg. Order"    value="$164.80"  delta="+8.1%"  />
      </div>

      {/* Revenue bar chart */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 32, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Revenue Trend</h3>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Monthly gross · SS26 season</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["6M", "1Y", "All"].map((p) => (
              <button
                key={p}
                style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid var(--border2)", background: p === "6M" ? "rgba(201,168,76,.15)" : "none", color: p === "6M" ? "var(--gold2)" : "var(--muted)", fontSize: 11, cursor: "pointer", fontFamily: "'Jost', sans-serif", transition: "all .2s" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingTop: 10, position: "relative" }}>
          {REV_LABELS.map((month, i) => (
            <div
              key={month}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {hoveredBar === i && (
                <div
                  style={{ position: "absolute", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "var(--text)", zIndex: 10, top: 0, whiteSpace: "nowrap", transform: "translateY(-100%)" }}
                >
                  {month}: ${REV_DATA[i].toLocaleString()}
                </div>
              )}
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, opacity: hoveredBar === i ? 1 : .7 }}>
                ${(REV_DATA[i] / 1000).toFixed(0)}k
              </span>
              <div style={{ width: "100%" }}>
                <div
                  className={`bar${i === REV_LABELS.length - 1 ? " active" : ""}`}
                  style={{ height: (REV_DATA[i] / maxRev) * 160, width: "100%", opacity: hoveredBar !== null && hoveredBar !== i ? .5 : 1, transition: "opacity .2s" }}
                />
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category + KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Category breakdown */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 22 }}>Sales by Category</h3>
          {[
            ["Dresses",     38, "var(--gold)"],
            ["Outerwear",   27, "var(--text)"],
            ["Tops",        18, "#8b7355"],
            ["Shoes",       11, "#6b9dd9"],
            ["Accessories",  6, "var(--dim)"],
          ].map(([cat, pct, color]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
                <span>{cat}</span>
                <span style={{ fontWeight: 600, color: "var(--gold2)" }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: "var(--lift)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width .8s cubic-bezier(.16,1,.3,1)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* KPI list */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 22 }}>Key Metrics</h3>
          {[
            ["Cart Abandonment",  "68.3%", "-2.1%", false],
            ["Return Rate",       "4.2%",  "-0.8%", false],
            ["Customer LTV",      "$842",  "+$63",  true],
            ["Repeat Purchase",   "34.5%", "+5.2%", true],
            ["Email Open Rate",   "42.8%", "+3.4%", true],
            ["Mobile Conv.",      "3.2%",  "+0.6%", true],
          ].map(([k, v, d, pos]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{k}</span>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span>
                <span style={{ fontSize: 11, color: pos ? "var(--emerald)" : "var(--rose)", marginLeft: 8 }}>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════ */
export const AdminSettings = ({ toast }) => {
  const SECTIONS = [
    { title: "Store Information", fields: [["Store Name", "Maison Élite"], ["Store Email", "hello@maisonelite.com"], ["Support Phone", "+33 1 42 86 98 00"], ["Currency", "USD"]] },
    { title: "Shipping Policy",   fields: [["Free Shipping Threshold", "$200"], ["Standard Rate", "$15"], ["Express Rate", "$35"], ["Delivery Window", "3-5 business days"]] },
    { title: "Notifications",     fields: [["New Order Email", "Enabled"], ["Low Stock Alert", "Enabled"], ["Weekly Report", "Enabled"]] },
  ];

  return (
    <div className="fu">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">Settings</h1>
        <p className="section-sub">Manage your store configuration</p>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.title} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 22 }}>{s.title}</h3>
          {s.fields.map(([label, defaultVal]) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>{label}</label>
              <input
                defaultValue={defaultVal}
                style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "var(--lift)", color: "var(--text)", fontSize: 13 }}
              />
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <Btn v="primary" onClick={() => toast("Settings saved ✦", "ok")}>Save Changes</Btn>
          </div>
        </div>
      ))}
    </div>
  );
};