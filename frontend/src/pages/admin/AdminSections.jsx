import { useState, useEffect, useRef } from "react";
import { Avatar, Btn, StatusTag } from "../../components/UI";
import { PRODUCTS, ORDERS, CUSTOMERS, REV_DATA, REV_LABELS } from "../../data/mockData";
import { productAPI, categoryAPI, mediaAPI } from "../../services/api";
import ProductFormModal from "./ProductFormModal";
import { IoCashOutline, IoBagOutline, IoPeopleOutline, IoHeartOutline, IoPersonOutline, IoStar, IoImagesOutline, IoSearchOutline, IoGridOutline, IoListOutline, IoCloudUploadOutline, IoCheckmarkOutline, IoCloseOutline, IoDownloadOutline } from "react-icons/io5";

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
      <StatCard icon={<IoCashOutline size={26} />} label="Revenue (Feb)" value="$48,290" delta="+18.4%" />
      <StatCard icon={<IoBagOutline size={26} />} label="Orders"        value="284"     delta="+7.2%"  />
      <StatCard icon={<IoPeopleOutline size={26} />} label="Customers"     value="1,842"   delta="+12.1%" />
      <StatCard icon={<IoHeartOutline size={26} />}  label="Wishlist"      value="4,218"   sub="Conversion 14.2%" />
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
              <img src={p.image?.url || p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
  const [allProds, setAllProds] = useState([]);
  const [cats,     setCats]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getProducts({ limit: 100 });
      setAllProds(data.products || []);
    } catch (err) {
      console.error("Fetch products failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getCategories();
      setCats(data.categories || []);
    } catch (err) {
      console.error("Fetch categories failed:", err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const items = allProds.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleSave = async (savedFormData) => {
    try {
      const id = savedFormData.get("_id");
      if (id) {
        // Update
        await productAPI.update(id, savedFormData);
      } else {
        // Create
        await productAPI.create(savedFormData);
      }
      fetchProducts(); // Refresh list
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this product?")) return;
    try {
      await productAPI.delete(id);
      fetchProducts();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="fu">
      {modal && (
        <ProductFormModal
          product={modal === "add" ? null : modal}
          categories={cats}
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
                    <img src={p.images?.[0] || p.image?.url || p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: "var(--muted)" }}>{p.category?.name || "Uncategorized"}</td>
                <td>
                  <span style={{ color: "var(--gold2)", fontWeight: 600 }}>${p.price}</span>
                  {p.orig && (
                    <span style={{ fontSize: 11, color: "var(--dim)", textDecoration: "line-through", marginLeft: 6 }}>
                      ${p.orig}
                    </span>
                  )}
                </td>
                <td>
                  <IoStar size={12} color="var(--gold)" style={{ verticalAlign: "middle", marginRight: 2 }} /> {p.rating}
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
                      onClick={() => handleDelete(p._id)}
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
        <Btn v="ghost"><IoDownloadOutline size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> Export CSV</Btn>
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
        <StatCard icon={<IoCashOutline size={26} />} label="Total Revenue" value="$263,090" delta="+24.3%" />
        <StatCard icon={<IoBagOutline size={26} />} label="Total Orders"  value="1,847"    delta="+15.2%" />
        <StatCard icon={<IoPersonOutline size={26} />}  label="Avg. Order"    value="$164.80"  delta="+8.1%"  />
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
            <Btn v="primary" onClick={() => toast("Settings saved", "ok")}>Save Changes</Btn>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MEDIA LIBRARY
═══════════════════════════════════════════════════ */
export const AdminMedia = () => {
  const [mediaList,  setMediaList]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [sort,       setSort]       = useState("newest");
  const [viewMode,   setViewMode]   = useState("grid");
  const [selected,   setSelected]   = useState(new Set());
  const [dragging,   setDragging]   = useState(false);
  const [drawer,     setDrawer]     = useState(null);  // null | media item
  const [copied,     setCopied]     = useState(null);
  const fileInputRef = useRef(null);

  /* ── Fetch ─────────────────────────────────────── */
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaAPI.getAll({ search, sort, source: filter });
      setMediaList(data.media || []);
      setSelected(new Set());
    } catch {
      alert("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, [search, sort, filter]);

  /* ── Upload (single or multiple) ───────────────── */
  const handleUpload = async (files) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      await mediaAPI.upload(Array.from(files));
      fetchMedia();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── Delete (single) ───────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this image from Library and Cloudinary?")) return;
    try {
      await mediaAPI.delete(id);
      if (drawer?._id === id) setDrawer(null);
      fetchMedia();
    } catch (err) { alert("Delete failed: " + err.message); }
  };

  /* ── Bulk delete ───────────────────────────────── */
  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} selected image(s) permanently?`)) return;
    try {
      await mediaAPI.bulkDelete([...selected]);
      fetchMedia();
    } catch (err) { alert("Bulk delete failed: " + err.message); }
  };

  /* ── Select toggle ─────────────────────────────── */
  const toggleSelect = (id, source) => {
    if (source === "product") return; // product images not deletable
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Copy URL ──────────────────────────────────── */
  const copyURL = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  /* ── Drag & Drop handlers ──────────────────────── */
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); };

  const libraryCount = mediaList.filter((m) => m.source === "library").length;
  const productCount = mediaList.filter((m) => m.source === "product").length;

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="fu" style={{ position: "relative" }}>

      {/* ── Inline styles for cards & drawer ── */}
      <style>{`
        .mc .ov { opacity:0; transition:.18s; background:rgba(0,0,0,.65);
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:9px; }
        .mc:hover .ov { opacity:1; }
        .mc .chk { position:absolute; top:8px; right:8px; z-index:6; width:20px; height:20px;
          border-radius:50%; border:2px solid #fff; background:rgba(0,0,0,.4);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          font-size:11px; color:#fff; transition:.15s; }
        .mc:hover .chk, .mc.sel .chk { opacity:1 !important; }
        .mc .chk { opacity:0; }
        .mc.sel .chk { background:var(--gold); border-color:var(--gold); color:#000; opacity:1 !important; }
        .drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; }
        .drawer { position:fixed; top:0; right:0; height:100vh; width:340px; background:var(--surface);
          border-left:1px solid var(--border); z-index:201; overflow-y:auto;
          display:flex; flex-direction:column; box-shadow:-4px 0 24px rgba(0,0,0,.4); }
        .bulk-bar { position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
          background:var(--card); border:1px solid var(--border2); border-radius:100px;
          padding:10px 20px; display:flex; align-items:center; gap:16px; z-index:199;
          box-shadow:0 8px 32px rgba(0,0,0,.4); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 className="section-title">Media Library</h1>
          <p className="section-sub">{mediaList.length} total · {libraryCount} uploaded · {productCount} from products</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <input type="file" accept="image/*" multiple ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files)} style={{ display:"none" }} />
          <button onClick={() => fileInputRef.current?.click()}
            style={{ padding:"9px 20px", background:"var(--gold)", color:"#000", border:"none",
              borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:700,
              fontFamily:"'Jost',sans-serif", letterSpacing:".08em", transition:"opacity .2s",
              opacity: uploading ? .6 : 1 }}>
            {uploading ? "Uploading…" : "+ Upload"}
          </button>
        </div>
      </div>

      {/* ── Toolbar (Search · Sort · View Toggle) ── */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {/* Search */}
        <div style={{ position:"relative", flex:1, minWidth:180 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)",
            color:"var(--muted)", fontSize:13, pointerEvents:"none", display:"flex" }}><IoSearchOutline size={14} /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images…"
            style={{ width:"100%", padding:"9px 12px 9px 32px", borderRadius:6,
              border:"1px solid var(--border2)", background:"var(--lift)",
              color:"var(--text)", fontSize:12, fontFamily:"'Jost',sans-serif",
              boxSizing:"border-box" }} />
        </div>
        {/* Sort */}
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:6, border:"1px solid var(--border2)",
            background:"var(--lift)", color:"var(--text)", fontSize:12,
            fontFamily:"'Jost',sans-serif", cursor:"pointer" }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A–Z</option>
          <option value="size">Largest First</option>
        </select>
        {/* View toggle */}
        <div style={{ display:"flex", border:"1px solid var(--border)", borderRadius:6, overflow:"hidden" }}>
          {[["grid",<IoGridOutline size={16} />],["list",<IoListOutline size={16} />]].map(([mode, icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ padding:"8px 14px", border:"none", cursor:"pointer", fontSize:15,
                background: viewMode === mode ? "rgba(201,168,76,.18)" : "none",
                color: viewMode === mode ? "var(--gold2)" : "var(--muted)",
                transition:"all .18s" }}>
              {icon}
            </button>
          ))}
        </div>
        {/* Filter tabs */}
        {[["all","All"],["library","Uploaded"],["product","Products"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding:"8px 16px", borderRadius:100, cursor:"pointer",
              border:`1px solid ${filter===val ? "var(--gold)" : "var(--border)"}`,
              background: filter===val ? "rgba(201,168,76,.12)" : "none",
              color: filter===val ? "var(--gold2)" : "var(--muted)",
              fontSize:11, letterSpacing:".08em", fontFamily:"'Jost',sans-serif", transition:"all .2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Drag & Drop Zone ── */}
      <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ border:`2px dashed ${dragging ? "var(--gold)" : "var(--border2)"}`,
          borderRadius:10, padding:"22px 0", textAlign:"center", marginBottom:20,
          background: dragging ? "rgba(201,168,76,.06)" : "var(--lift)",
          cursor:"pointer", transition:"all .2s",
          boxShadow: dragging ? "0 0 0 3px rgba(201,168,76,.15)" : "none" }}>
        <p style={{ fontSize:24, marginBottom:6, opacity:.7, display:"flex", justifyContent:"center" }}><IoCloudUploadOutline size={28} /></p>
        <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
          {dragging ? "Drop to upload!" : "Drag & drop images here, or click to browse"}
        </p>
        <p style={{ fontSize:10, color:"var(--dim)", marginTop:4 }}>Supports JPG · PNG · WEBP · multiple files at once</p>
      </div>

      {/* ── GRID / LIST ── */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:24, minHeight:300 }}>
        {loading ? (
          <p style={{ color:"var(--dim)" }}>Loading media…</p>
        ) : mediaList.length === 0 ? (
          <div style={{ textAlign:"center", padding:"50px 0", color:"var(--muted)" }}>
            <p style={{ fontSize:36, marginBottom:14, display:"flex", justifyContent:"center" }}><IoImagesOutline size={40} /></p>
            <p>No images found. Upload your first image to get started.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* ── Grid ── */
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:18 }}>
            {mediaList.map((m) => {
              const isSelected = selected.has(String(m._id));
              return (
                <div key={m._id + m.source} className={`mc${isSelected ? " sel" : ""}`}
                  style={{ border:`1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                    borderRadius:8, overflow:"hidden", background:"var(--lift)", position:"relative",
                    cursor:"pointer", transition:"border-color .2s",
                    boxShadow: isSelected ? "0 0 0 2px rgba(201,168,76,.25)" : "none" }}>
                  {/* Source badge */}
                  <div style={{ position:"absolute", top:8, left:8, zIndex:5, padding:"2px 7px",
                    borderRadius:4, fontSize:9, fontWeight:700, letterSpacing:".08em",
                    textTransform:"uppercase",
                    background: m.source === "product" ? "rgba(107,157,217,.9)" : "rgba(201,168,76,.9)",
                    color: m.source === "product" ? "#fff" : "#000" }}>
                    {m.source === "product" ? "Product" : "Library"}
                  </div>
                  {/* Checkbox */}
                  {m.source !== "product" && (
                    <div className="chk" onClick={(e) => { e.stopPropagation(); toggleSelect(String(m._id), m.source); }}>
                      {isSelected ? <IoCheckmarkOutline size={12} /> : ""}
                    </div>
                  )}
                  {/* Image */}
                  <div style={{ width:"100%", aspectRatio:"1/1", position:"relative" }}
                    onClick={() => setDrawer(m)}>
                    <img src={m.url} alt={m.productName || "media"}
                      style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    <div className="ov">
                      <button onClick={(e) => { e.stopPropagation(); copyURL(m.url, m._id); }}
                        style={{ padding:"7px 14px", background:"var(--gold)", color:"#000",
                          border:"none", borderRadius:4, cursor:"pointer", fontSize:11, fontWeight:700 }}>
                        {copied === m._id ? <><IoCheckmarkOutline size={12} /> Copied!</> : "Copy URL"}
                      </button>
                      {m.source !== "product" && (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(m._id); }}
                          style={{ padding:"7px 14px", background:"var(--rose)", color:"#fff",
                            border:"none", borderRadius:4, cursor:"pointer", fontSize:11, fontWeight:500 }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Footer */}
                  <div style={{ padding:"8px 10px", borderTop:"1px solid var(--border)" }}
                    onClick={() => setDrawer(m)}>
                    <p style={{ fontSize:11, color:"var(--text)", fontWeight:500,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {m.productName || (m.public_id ? m.public_id.split("/").pop() : "media")}
                    </p>
                    <p style={{ fontSize:9, color:"var(--muted)", marginTop:3 }}>
                      {m.size ? (m.size/1024).toFixed(1)+"KB · " : ""}{(m.format||"IMG").toUpperCase()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── List ── */
          <table className="tbl" style={{ width:"100%" }}>
            <thead>
              <tr>
                <th style={{ width:40 }}></th>
                <th></th>
                <th>Name</th>
                <th>Source</th>
                <th>Size</th>
                <th>Format</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((m) => {
                const isSelected = selected.has(String(m._id));
                return (
                  <tr key={m._id + m.source}
                    style={{ background: isSelected ? "rgba(201,168,76,.06)" : "none", cursor:"pointer" }}>
                    {/* Checkbox */}
                    <td onClick={(e) => e.stopPropagation()}>
                      {m.source !== "product" && (
                        <div onClick={() => toggleSelect(String(m._id), m.source)}
                          style={{ width:18, height:18, borderRadius:"50%", border:"2px solid var(--border2)",
                            background: isSelected ? "var(--gold)" : "none",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            cursor:"pointer", fontSize:10, color:"#000", transition:".15s" }}>
                          {isSelected ? <IoCheckmarkOutline size={11} /> : ""}
                        </div>
                      )}
                    </td>
                    {/* Thumb */}
                    <td onClick={() => setDrawer(m)}>
                      <div style={{ width:44, height:44, borderRadius:5, overflow:"hidden",
                        background:"var(--lift)", border:"1px solid var(--border)", flexShrink:0 }}>
                        <img src={m.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                    </td>
                    <td onClick={() => setDrawer(m)} style={{ fontSize:12, fontWeight:500, maxWidth:200,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {m.productName || (m.public_id ? m.public_id.split("/").pop() : "media")}
                    </td>
                    <td>
                      <span style={{ padding:"2px 8px", borderRadius:4, fontSize:9, fontWeight:700,
                        background: m.source==="product" ? "rgba(107,157,217,.2)" : "rgba(201,168,76,.2)",
                        color: m.source==="product" ? "#6b9dd9" : "var(--gold2)" }}>
                        {m.source === "product" ? "Product" : "Library"}
                      </span>
                    </td>
                    <td style={{ fontSize:11, color:"var(--muted)" }}>
                      {m.size ? (m.size/1024).toFixed(1)+" KB" : "—"}
                    </td>
                    <td style={{ fontSize:11, color:"var(--muted)" }}>
                      {(m.format||"IMG").toUpperCase()}
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => copyURL(m.url, m._id)}
                          style={{ padding:"4px 10px", borderRadius:4, border:"1px solid var(--border2)",
                            background:"none", color: copied===m._id ? "var(--gold2)" : "var(--text)",
                            cursor:"pointer", fontSize:10, fontFamily:"'Jost',sans-serif" }}>
                          {copied===m._id ? <><IoCheckmarkOutline size={11} /> Copied</> : "Copy URL"}
                        </button>
                        {m.source !== "product" && (
                          <button onClick={() => handleDelete(m._id)}
                            style={{ padding:"4px 10px", borderRadius:4,
                              border:"1px solid rgba(192,57,43,.3)",
                              background:"none", color:"var(--rose)",
                              cursor:"pointer", fontSize:10, fontFamily:"'Jost',sans-serif" }}>
                            Del
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Bulk Action Bar ── */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span style={{ fontSize:12, color:"var(--gold2)", fontWeight:600 }}>
            {selected.size} selected
          </span>
          <button onClick={handleBulkDelete}
            style={{ padding:"6px 16px", borderRadius:100, background:"var(--rose)",
              color:"#fff", border:"none", cursor:"pointer", fontSize:11,
              fontFamily:"'Jost',sans-serif", fontWeight:600 }}>
            Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())}
            style={{ background:"none", border:"none", color:"var(--muted)",
              cursor:"pointer", fontSize:16, lineHeight:1 }}>
            ×
          </button>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {drawer && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawer(null)} />
          <div className="drawer">
            {/* Preview */}
            <div style={{ width:"100%", aspectRatio:"1/1", background:"#000" }}>
              <img src={drawer.url} alt="preview"
                style={{ width:"100%", height:"100%", objectFit:"contain" }} />
            </div>
            {/* Info */}
            <div style={{ padding:20, flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:400, flex:1 }}>
                  {drawer.productName || (drawer.public_id ? drawer.public_id.split("/").pop() : "media")}
                </p>
                <button onClick={() => setDrawer(null)}
                  style={{ background:"none", border:"none", color:"var(--muted)",
                    cursor:"pointer", fontSize:20, lineHeight:1, flexShrink:0 }}>×</button>
              </div>
              {/* Meta rows */}
              {[
                ["Source",  drawer.source === "product" ? "Product Image" : "Library Upload"],
                ["Format",  (drawer.format || "Unknown").toUpperCase()],
                ["Size",    drawer.size ? (drawer.size/1024).toFixed(1)+" KB" : "—"],
                ["Uploaded", drawer.createdAt ? new Date(drawer.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—"],
                ...(drawer.productName ? [["Product", drawer.productName]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between",
                  padding:"9px 0", borderBottom:"1px solid var(--border)", fontSize:12 }}>
                  <span style={{ color:"var(--muted)" }}>{k}</span>
                  <span style={{ fontWeight:500, textAlign:"right", maxWidth:"60%",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</span>
                </div>
              ))}
              {/* URL copy */}
              <div style={{ marginTop:20 }}>
                <p style={{ fontSize:10, color:"var(--muted)", letterSpacing:".1em",
                  textTransform:"uppercase", marginBottom:8 }}>Image URL</p>
                <div style={{ display:"flex", gap:8 }}>
                  <input readOnly value={drawer.url}
                    onClick={(e) => e.target.select()}
                    style={{ flex:1, padding:"8px 10px", borderRadius:5,
                      border:"1px solid var(--border2)", background:"var(--lift)",
                      color:"var(--dim)", fontSize:10, overflow:"hidden",
                      textOverflow:"ellipsis" }} />
                  <button onClick={() => copyURL(drawer.url, drawer._id)}
                    style={{ padding:"8px 14px", background:"var(--gold)", color:"#000",
                      border:"none", borderRadius:5, cursor:"pointer",
                      fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
                    {copied === drawer._id ? <IoCheckmarkOutline size={12} /> : "Copy"}
                  </button>
                </div>
              </div>
              {/* Delete */}
              {drawer.source !== "product" && (
                <button onClick={() => handleDelete(drawer._id)} style={{ marginTop:18,
                  width:"100%", padding:"10px", borderRadius:6,
                  border:"1px solid rgba(192,57,43,.4)", background:"none",
                  color:"var(--rose)", cursor:"pointer", fontSize:12,
                  fontFamily:"'Jost',sans-serif", fontWeight:500 }}>
                  Delete from Library
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};


