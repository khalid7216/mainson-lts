import { useState, useEffect, useRef } from "react";
import { Avatar, Btn, StatusTag } from "../../components/UI";
import { PRODUCTS, ORDERS, CUSTOMERS, REV_DATA, REV_LABELS } from "../../data/mockData";
import { productAPI, categoryAPI, mediaAPI, orderAPI, authAPI, bannerAPI, pageAPI, seoAPI } from "../../services/api";
import ProductFormModal from "./ProductFormModal";
import CategoryFormModal from "./CategoryFormModal";
import RichTextEditor from "./RichTextEditor";
import { IoCashOutline, IoBagOutline, IoPeopleOutline, IoHeartOutline, IoPersonOutline, IoStar, IoImagesOutline, IoSearchOutline, IoGridOutline, IoListOutline, IoCloudUploadOutline, IoCheckmarkOutline, IoCloseOutline, IoDownloadOutline, IoFolderOutline } from "react-icons/io5";

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
export const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [totalOrders, setTotalOrders] = useState(284);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          orderAPI.getAllOrders("All"),
          productAPI.getProducts({ limit: 5 })
        ]);
        setRecentOrders(ordersRes.orders ? ordersRes.orders.slice(0, 5) : []);
        setTotalOrders(ordersRes.total || 0);
        setTopProducts(productsRes.products ? productsRes.products.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="fu">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title" style={{ fontSize: 36 }}>Dashboard</h1>
        <p className="section-sub">
          {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())} · Live Overview
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
        <StatCard icon={<IoCashOutline size={26} />} label="Revenue (Month)" value="$48,290" delta="+18.4%" />
        <StatCard icon={<IoBagOutline size={26} />} label="Orders" value={loading ? "..." : totalOrders} delta="+7.2%" />
        <StatCard icon={<IoPeopleOutline size={26} />} label="Customers" value="1,842" delta="+12.1%" />
        <StatCard icon={<IoHeartOutline size={26} />} label="Wishlist" value="4,218" sub="Conversion 14.2%" />
      </div>

      {/* Recent orders + Top sellers */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
        {/* Recent orders */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Recent Orders</h3>
          {loading ? (
             <p style={{ color: "var(--dim)", fontSize: 13 }}>Loading recent orders...</p>
          ) : recentOrders.length === 0 ? (
             <p style={{ color: "var(--dim)", fontSize: 13 }}>No recent orders.</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600, fontSize: 12, color: "var(--gold2)" }}>{o.orderId}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={o.user?.name || "Unknown"} size={26} />
                        <span>{o.user?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>${o.totalAmount}</td>
                    <td><StatusTag status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top sellers */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Top Sellers</h3>
          {loading ? (
             <p style={{ color: "var(--dim)", fontSize: 13 }}>Loading products...</p>
          ) : topProducts.length === 0 ? (
             <p style={{ color: "var(--dim)", fontSize: 13 }}>No products found.</p>
          ) : (
            topProducts.map((p, i) => (
              <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 10, color: "var(--dim)", width: 16 }}>#{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: "var(--lift)", border: "1px solid var(--border)", flexShrink: 0 }}>
                  <img src={p.images?.[0] || p.image?.url || p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <div style={{ height: 3, width: `${(p.rating || 4) / 5 * 100}%`, maxWidth: "80%", background: "var(--gold)", borderRadius: 2, opacity: .6 }} />
                    <span style={{ fontSize: 10, color: "var(--dim)" }}>{p.reviews || Math.floor(Math.random() * 50) + i * 2} sold</span>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold2)" }}>${p.price}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   BANNERS
═══════════════════════════════════════════════════ */
export const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null, "add", banner object

  const fetchBanners = async () => {
    try {
      const data = await bannerAPI.getBanners();
      setBanners(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await bannerAPI.delete(id);
      fetchBanners();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      if (modal && modal !== "add") {
        await bannerAPI.update(modal._id, payload);
      } else {
        await bannerAPI.create(payload);
      }
      setModal(null);
      fetchBanners();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="section-title">Banners</h1>
            <p className="section-sub">Manage your banners and sliders across different sections</p>
          </div>
          <Btn v="primary" onClick={() => setModal("add")}>+ Add Banner</Btn>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 24px" }}>
          <div className="tbl-wrap">
            {loading ? <p style={{ color: "var(--dim)" }}>Loading banners...</p> : (
            <table className="tbl">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Section</th><th>Order</th><th>Status</th><th>Image</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b._id}>
                  <td style={{ fontWeight: 500 }}>{b.title}</td>
                  <td style={{ color: "var(--muted)" }}>{b.type}</td>
                  <td style={{ color: "var(--dim)", fontSize: 13 }}>
                    <span style={{ padding: "4px 8px", background: "rgba(46,204,113,.1)", color: "var(--emerald)", borderRadius: 4 }}>{b.section}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{b.order}</td>
                  <td><StatusTag status={b.status} /></td>
                  <td>
                    <div style={{ width: 60, height: 30, borderRadius: 4, overflow: "hidden", background: "var(--lift)" }}>
                      {b.image?.url ? <img src={b.image.url} alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "var(--dim)", fontSize: 10, paddingLeft: 4 }}>None</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setModal(b)} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: "pointer", fontSize: 11 }}>Edit</button>
                      <button onClick={() => handleDelete(b._id)} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(192,57,43,.3)", background: "none", color: "var(--rose)", cursor: "pointer", fontSize: 11 }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
            )}
          </div>
        </div>

      {modal && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 500 }}>
            <h2 style={{ marginBottom: 20 }}>{modal === "add" ? "Create Banner" : "Edit Banner"}</h2>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Title</label>
                <input name="title" defaultValue={modal?.title} required style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Type</label>
                  <select name="type" defaultValue={modal?.type} style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }}>
                    <option>Banner</option>
                    <option>Slider</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Status</label>
                  <select name="status" defaultValue={modal?.status} style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Section</label>
                <input name="section" defaultValue={modal?.section} required style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Order</label>
                  <input type="number" min="0" name="order" defaultValue={modal?.order || 0} style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }} />
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Image URL</label>
                  <input name="image.url" defaultValue={modal?.image?.url} required style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <Btn v="ghost" type="button" onClick={() => setModal(null)}>Cancel</Btn>
                <Btn v="primary" type="submit">Save Banner</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════
   PAGES
═══════════════════════════════════════════════════ */
export const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editorContent, setEditorContent] = useState("");

  const fetchPages = async () => {
    try {
      const data = await pageAPI.getPages();
      setPages(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await pageAPI.delete(id);
      fetchPages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    payload.content = editorContent; // Use rich editor content
    
    if (!payload.content || payload.content === "<br>") {
      alert("Please add some content to the page.");
      return;
    }
    
    try {
      if (modal && modal !== "add") {
        await pageAPI.update(modal._id, payload);
      } else {
        await pageAPI.create(payload);
      }
      setModal(null);
      setEditorContent("");
      fetchPages();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <>
      <div className="fu">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="section-title">Pages</h1>
            <p className="section-sub">Manage dynamic web pages and content.</p>
          </div>
          <Btn v="primary" onClick={() => setModal("add")}>+ Add Page</Btn>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 24px" }}>
          <div className="tbl-wrap">
            {loading ? <p style={{ color: "var(--dim)" }}>Loading pages...</p> : (
            <table className="tbl">
            <thead>
              <tr><th>Title</th><th>Slug</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 500 }}>{p.title}</td>
                  <td style={{ color: "var(--dim)", fontSize: 13 }}>/page/{p.slug}</td>
                  <td><StatusTag status={p.status} /></td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => window.open(`/page/${p.slug}`, '_blank')} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid var(--border2)", background: "none", color: "var(--gold)", cursor: "pointer", fontSize: 11 }}>View</button>
                      <button onClick={() => setModal(p)} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: "pointer", fontSize: 11 }}>Edit</button>
                      <button onClick={() => handleDelete(p._id)} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(192,57,43,.3)", background: "none", color: "var(--rose)", cursor: "pointer", fontSize: 11 }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
            )}
        </div>
      </div>
    </div>

      {modal && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 800 }}>
            <h2 style={{ marginBottom: 20 }}>{modal === "add" ? "Create Page" : "Edit Page"}</h2>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Title</label>
                  <input name="title" defaultValue={modal?.title} required style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Slug (auto if empty)</label>
                  <input name="slug" defaultValue={modal?.slug} style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }} />
                </div>
                <div style={{ minWidth: 130 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Status</label>
                  <select name="status" defaultValue={modal?.status || "active"} style={{ width: "100%", padding: 10, background: "var(--lift)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--muted)" }}>Content</label>
                <RichTextEditor
                  key={modal?._id || "new"}
                  defaultValue={modal !== "add" ? modal?.content || "" : ""}
                  onChange={(html) => setEditorContent(html)}
                  placeholder="Start writing your page content..."
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Btn v="ghost" type="button" onClick={() => setModal(null)}>Cancel</Btn>
                <Btn v="primary" type="submit">Save Page</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════════════════ */
export const AdminProducts = () => {
  const [query,   setQuery]   = useState("");
  const [selectedCat, setSelectedCat] = useState("All Categories");
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

  const items = allProds.filter((p) => {
    const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchCat = selectedCat === "All Categories" || (p.parentCategory?.name === selectedCat);
    return matchQuery && matchCat;
  });

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
          key={modal === "add" ? "add-product" : modal._id}
          product={modal === "add" ? null : modal}
          categories={cats}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="section-title">Products</h1>
          <p className="section-sub">{allProds.length} items in catalogue</p>
        </div>
        <Btn v="primary" onClick={() => setModal("add")}>+ Add Product</Btn>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            style={{ flex: 1, minWidth: 200, maxWidth: 320, padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "var(--lift)", color: "var(--text)", fontSize: 13 }}
          />
          <select 
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "var(--lift)", color: "var(--text)", fontSize: 12 }}>
            <option value="All Categories">All Categories</option>
            {cats.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
          <thead>
            <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td style={{ width: 60, padding: "10px" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 6, overflow: "hidden", background: "var(--lift)", border: "1px solid var(--border)" }}>
                    <img src={p.images?.[0] || p.image?.url || p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: "var(--muted)" }}>{p.parentCategory?.name || "Uncategorized"}</td>
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
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════════ */
export const AdminCategories = () => {
  const [modal, setModal] = useState(null); // null | "add" | category object
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (payload) => {
    try {
      if (payload._id) {
        await categoryAPI.updateCategory(payload._id, { ...payload });
      } else {
        await categoryAPI.createCategory({ ...payload });
      }
      fetchCategories();
    } catch (err) {
      alert("Error saving category: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryAPI.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      // Show backend guard message natively
      alert(err.response?.data?.message || err.message || "Failed to delete");
    }
  };

  return (
    <div className="fu">
      {modal && (
        <CategoryFormModal
          category={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="section-title">Categories</h1>
          <p className="section-sub">{categories.length} taxonomy trees active</p>
        </div>
        <Btn v="primary" onClick={() => setModal("add")}>+ Add Category</Btn>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
        {loading ? <p style={{ color: "var(--dim)" }}>Loading...</p> : (
        <table className="tbl">
          <thead>
            <tr><th>Name</th><th>Slug</th><th>Banner</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                     <IoFolderOutline style={{ color: "var(--gold)" }} size={16} /> {c.name}
                  </div>
                </td>
                <td style={{ color: "var(--dim)", fontSize: 13 }}>/{c.slug}</td>
                <td>
                  {c.image ? (
                    <div style={{ width: 44, height: 28, borderRadius: 4, overflow: "hidden", background: "var(--lift)" }}>
                      <img src={c.image} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : <span style={{ color: "var(--dim)" }}>—</span>}
                </td>
                <td style={{ color: "var(--muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.description || "—"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setModal(c)} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: "pointer", fontSize: 11, transition: "all .2s" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c._id)} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(192,57,43,.3)", background: "none", color: "var(--rose)", cursor: "pointer", fontSize: 11 }}>
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAllOrders(filter.toLowerCase());
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (id, currentStatus) => {
    // Basic cyclic status update for demo/action button
    const sequence = ["pending", "processing", "shipped", "delivered"];
    if (currentStatus === "cancelled") return;
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) return; // already delivered or unknown
    const nextStatus = sequence[currentIndex + 1];

    try {
      setUpdatingId(id);
      await orderAPI.updateOrderStatus(id, nextStatus);
      // Optimistic UI update — only update the changed order in state, no full refetch/reload
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: nextStatus } : o));
    } catch (err) {
      alert("Status update failed: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="section-title">Orders</h1>
          <p className="section-sub">{orders.length} total orders matching "{filter}"</p>
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
        {loading ? (
          <p style={{ color: "var(--dim)" }}>Loading orders…</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: 36, marginBottom: 14, display: "flex", justifyContent: "center" }}><IoBagOutline size={40} /></p>
            <p>No orders found for this category.</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 700, color: "var(--gold2)", fontSize: 12 }}>{o.orderId}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={o.user?.name || "Unknown"} size={30} />
                      {o.user?.name || "Unknown"}
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)" }}>
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(o.createdAt))}
                  </td>
                  <td>{o.items?.length || 0}</td>
                  <td style={{ fontWeight: 700, fontSize: 14 }}>${o.totalAmount}</td>
                  <td><StatusTag status={o.status} /></td>
                  <td>
                    <button
                      disabled={updatingId === o._id || o.status === "cancelled" || o.status === "delivered"}
                      onClick={() => handleStatusChange(o._id, o.status)}
                      style={{ padding: "5px 14px", borderRadius: 5, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: (updatingId === o._id || o.status === "cancelled" || o.status === "delivered") ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "'Jost', sans-serif", transition: "all .2s", opacity: (o.status === "cancelled" || o.status === "delivered") ? 0.5 : 1 }}
                      onMouseEnter={(e) => { if (!e.target.disabled) e.target.style.borderColor = "var(--gold)"; }}
                      onMouseLeave={(e) => { if (!e.target.disabled) e.target.style.borderColor = "var(--border2)"; }}
                    >
                      {updatingId === o._id ? "Updating..." : (o.status === "delivered" || o.status === "cancelled" ? "View" : "Advance")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CUSTOMERS
═══════════════════════════════════════════════════ */
export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await authAPI.getCustomers();
        setCustomers(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="fu">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">Customers</h1>
        <p className="section-sub">{customers.length} registered members</p>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
        {loading ? <p style={{ color: "var(--dim)" }}>Loading members...</p> : (
        <table className="tbl">
          <thead>
            <tr><th>Customer</th><th>Email</th><th>Joined</th><th>Orders</th><th>Total Spent</th><th>Tier</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar name={c.name} size={34} />
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--muted)" }}>{c.email}</td>
                <td style={{ color: "var(--muted)" }}>
                  {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(c.joined))}
                </td>
                <td style={{ fontWeight: 600 }}>{c.orders}</td>
                <td style={{ fontWeight: 700, color: "var(--gold2)" }}>${c.spent.toLocaleString()}</td>
                <td><StatusTag status={c.tier} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════════════════ */
export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await orderAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analytics) return <div className="fu"><p style={{ color: "var(--dim)" }}>Loading analytics...</p></div>;

  const maxRev = Math.max(...analytics.chart.data, 1); // Avoid div by 0

  return (
    <div className="fu">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">Analytics</h1>
        <p className="section-sub">Performance overview · Last 6 months</p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 28 }}>
        <StatCard icon={<IoCashOutline size={26} />} label="Total Revenue" value={`$${analytics.totalRevenue.toLocaleString()}`} delta="Live" />
        <StatCard icon={<IoBagOutline size={26} />} label="Total Orders"  value={analytics.totalOrders} delta="Live" />
        <StatCard icon={<IoPersonOutline size={26} />}  label="Avg. Order" value={`$${analytics.avgOrder}`} delta="Live"  />
      </div>

      {/* Revenue bar chart */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 32, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Revenue Trend</h3>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Monthly gross · Live data</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["6M"].map((p) => (
              <button
                key={p}
                style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid var(--border2)", background: "rgba(201,168,76,.15)", color: "var(--gold2)", fontSize: 11, cursor: "pointer", fontFamily: "'Jost', sans-serif", transition: "all .2s" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingTop: 10, position: "relative" }}>
          {analytics.chart.labels.map((month, i) => (
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
                  {month}: ${analytics.chart.data[i].toLocaleString()}
                </div>
              )}
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, opacity: hoveredBar === i ? 1 : .7 }}>
                ${(analytics.chart.data[i] / 1000).toFixed(1)}k
              </span>
              <div style={{ width: "100%" }}>
                <div
                  className={`bar${i === analytics.chart.labels.length - 1 ? " active" : ""}`}
                  style={{ height: (analytics.chart.data[i] / maxRev) * 160, width: "100%", opacity: hoveredBar !== null && hoveredBar !== i ? .5 : 1, transition: "opacity .2s" }}
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

  const [categories, setCategories] = useState([]);
  const [uploadCat,  setUploadCat]  = useState("");
  const [filterCat,  setFilterCat]  = useState("All");

  useEffect(() => {
    categoryAPI.getCategories().then(res => setCategories(res.categories || [])).catch(() => {});
  }, []);

  /* ── Fetch ─────────────────────────────────────── */
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaAPI.getAll({ search, sort, source: filter, categoryId: filterCat });
      setMediaList(data.media || []);
      setSelected(new Set());
    } catch {
      alert("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, [search, sort, filter, filterCat]);

  /* ── Upload (single or multiple) ───────────────── */
  const handleUpload = async (files) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      await mediaAPI.upload(Array.from(files), uploadCat);
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
          <select value={uploadCat} onChange={e => setUploadCat(e.target.value)} style={{ padding:"9px 12px", borderRadius:6, border:"1px solid var(--border2)", background:"var(--lift)", color:"var(--text)", fontSize:12, fontFamily:"'Jost',sans-serif" }}>
            <option value="">(No Category) Upload Folder</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
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
        {/* Category Filter */}
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:6, border:"1px solid var(--border2)",
            background:"var(--lift)", color:"var(--text)", fontSize:12,
            fontFamily:"'Jost',sans-serif", cursor:"pointer" }}>
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
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

/* ═══════════════════════════════════════════════════
   ADMIN SEO
═══════════════════════════════════════════════════ */
export const AdminSeo = () => {
  const PAGES = [
    { key: "home",     label: "Home Page" },
    { key: "shop",     label: "Shop / Collection" },
    { key: "product",  label: "Product Pages (default)" },
    { key: "cart",     label: "Cart" },
    { key: "checkout", label: "Checkout" },
    { key: "profile",  label: "Profile" },
    { key: "about",    label: "About Us" },
    { key: "contact",  label: "Contact" },
  ];

  const [selectedPage, setSelectedPage] = useState("home");
  const [form, setForm] = useState({ title: "", description: "", keywords: "", ogImage: "", canonical: "", noIndex: false });
  const [loading, setLoading]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState("");
  const [allConfigs, setAllConfigs] = useState([]);

  /* Fetch existing SEO when page changes */
  useEffect(() => {
    if (!selectedPage) return;
    setLoading(true);
    setError("");
    setSaved(false);
    seoAPI.getByPage(selectedPage)
      .then(res => {
        const s = res.seo;
        setForm({
          title:       s.title       || "",
          description: s.description || "",
          keywords:    Array.isArray(s.keywords) ? s.keywords.join(", ") : (s.keywords || ""),
          ogImage:     s.ogImage     || "",
          canonical:   s.canonical   || "",
          noIndex:     s.noIndex     || false,
        });
      })
      .catch(() => setForm({ title: "", description: "", keywords: "", ogImage: "", canonical: "", noIndex: false }))
      .finally(() => setLoading(false));
  }, [selectedPage]);

  /* Also load all configs for the table */
  const fetchAllConfigs = () => {
    seoAPI.getAll().then(res => setAllConfigs(res.configs || [])).catch(() => {});
  };
  useEffect(() => { fetchAllConfigs(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await seoAPI.upsert({ pageName: selectedPage, ...form });
      setSaved(true);
      fetchAllConfigs();
      // Clear cache so SEO component re-fetches
      sessionStorage.removeItem(`seo_${selectedPage}`);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save. Check all fields.");
    } finally {
      setSaving(false);
    }
  };

  const titleLen = form.title.length;
  const descLen  = form.description.length;
  const titleColor = titleLen > 60 ? "var(--rose)" : titleLen > 50 ? "var(--gold)" : "var(--emerald)";
  const descColor  = descLen  > 160 ? "var(--rose)" : descLen > 140 ? "var(--gold)" : "var(--emerald)";

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "var(--lift)", border: "1px solid var(--border)",
    color: "var(--text)", borderRadius: 6, fontSize: 13,
    fontFamily: "'Jost', sans-serif",
  };
  const labelStyle = { display: "block", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 7 };

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 className="section-title">SEO Manager</h1>
          <p className="section-sub">Control meta titles, descriptions, and Open Graph tags per page — database-driven.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>

        {/* ── Left: Form ── */}
        <form onSubmit={handleSave} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Page Selector */}
          <div>
            <label style={labelStyle}>Select Page</label>
            <select
              value={selectedPage}
              onChange={e => setSelectedPage(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {PAGES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>

          {loading ? (
            <p style={{ color: "var(--dim)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Loading current SEO data...</p>
          ) : (<>

          {/* Meta Title */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Meta Title</label>
              <span style={{ fontSize: 11, color: titleColor, fontVariantNumeric: "tabular-nums" }}>
                {titleLen} / 60
              </span>
            </div>
            <input
              style={{ ...inputStyle, borderColor: titleLen > 60 ? "var(--rose)" : "var(--border)" }}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Maison Élite — Luxury Fashion House"
              maxLength={70}
              required
            />
            <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 5 }}>
              Google shows the first 55–60 characters in search results.
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Meta Description</label>
              <span style={{ fontSize: 11, color: descColor, fontVariantNumeric: "tabular-nums" }}>
                {descLen} / 160
              </span>
            </div>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80, borderColor: descLen > 160 ? "var(--rose)" : "var(--border)" }}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="A brief, compelling description that appears in Google results…"
              rows={3}
              maxLength={170}
              required
            />
            <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 5 }}>
              Keep between 120–160 characters for best visibility.
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label style={labelStyle}>Keywords (comma-separated)</label>
            <input
              style={inputStyle}
              value={form.keywords}
              onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
              placeholder="luxury fashion, maison elite, designer clothing"
            />
          </div>

          {/* OG Image */}
          <div>
            <label style={labelStyle}>OG Image URL (for WhatsApp / social preview)</label>
            <input
              style={inputStyle}
              value={form.ogImage}
              onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
              placeholder="https://yoursite.com/og-image.jpg  (1200×630 recommended)"
            />
          </div>

          {/* noIndex toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={form.noIndex}
              onChange={e => setForm(f => ({ ...f, noIndex: e.target.checked }))}
              style={{ accentColor: "var(--gold)", width: 16, height: 16 }}
            />
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              <strong style={{ color: "var(--text)" }}>noindex</strong> — tell Google NOT to index this page
            </span>
          </label>

          {/* Error / success */}
          {error && <p style={{ background: "rgba(192,57,43,.1)", border: "1px solid rgba(192,57,43,.3)", color: "var(--rose)", padding: "10px 14px", borderRadius: 6, fontSize: 12 }}>{error}</p>}
          {saved && <p style={{ background: "rgba(46,204,113,.1)", border: "1px solid rgba(46,204,113,.3)", color: "var(--emerald)", padding: "10px 14px", borderRadius: 6, fontSize: 12 }}>✓ SEO config saved successfully!</p>}

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn v="primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save SEO Config"}
            </Btn>
          </div>

          </>)}
        </form>

        {/* ── Right: Google Preview + Table ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Google Search Preview Card */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Google Search Preview</p>

            <div style={{ background: "#fff", borderRadius: 8, padding: "16px 20px", fontFamily: "Arial, sans-serif" }}>
              {/* Site URL */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f1f3f4", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, color: "#202124", lineHeight: 1.2 }}>mainson-frontend.vercel.app</p>
                  <p style={{ fontSize: 11, color: "#4d5156" }}>
                    {window.location.origin} › {selectedPage === "home" ? "" : selectedPage}
                  </p>
                </div>
              </div>
              {/* Title */}
              <p style={{
                fontSize: 18,
                color: form.title ? "#1a0dab" : "#9aa0a6",
                fontWeight: 400,
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 480,
              }}>
                {form.title || "Your Page Title Will Appear Here"}
              </p>
              {/* Description */}
              <p style={{
                fontSize: 13,
                color: form.description ? "#4d5156" : "#9aa0a6",
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                maxWidth: 520,
              }}>
                {form.description || "Your meta description will appear here. Make it compelling and under 160 characters."}
              </p>
            </div>

            {/* Character meters */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  <span>Title length</span>
                  <span style={{ color: titleColor }}>{titleLen}/60</span>
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (titleLen / 60) * 100)}%`, background: titleColor, borderRadius: 2, transition: "all .3s" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  <span>Description length</span>
                  <span style={{ color: descColor }}>{descLen}/160</span>
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (descLen / 160) * 100)}%`, background: descColor, borderRadius: 2, transition: "all .3s" }} />
                </div>
              </div>
            </div>
          </div>

          {/* All SEO configs table */}
          {allConfigs.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Saved SEO Configs</p>
              <table className="tbl">
                <thead>
                  <tr><th>Page</th><th>Title</th><th>noIndex</th><th>Updated</th></tr>
                </thead>
                <tbody>
                  {allConfigs.map(c => (
                    <tr key={c._id} style={{ cursor: "pointer" }} onClick={() => setSelectedPage(c.pageName)}>
                      <td style={{ fontWeight: 600, color: "var(--gold2)", fontSize: 12 }}>{c.pageName}</td>
                      <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{c.title}</td>
                      <td>{c.noIndex ? <span style={{ color: "var(--rose)", fontSize: 11 }}>noindex</span> : <span style={{ color: "var(--emerald)", fontSize: 11 }}>index</span>}</td>
                      <td style={{ color: "var(--dim)", fontSize: 11 }}>{new Date(c.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
