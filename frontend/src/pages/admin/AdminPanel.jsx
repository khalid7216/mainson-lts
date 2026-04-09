// frontend/src/pages/admin/AdminPanel.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Avatar, Btn, Tag } from "../../components/UI";
import { IoGridOutline, IoCubeOutline, IoReceiptOutline, IoPeopleOutline, IoTrendingUpOutline, IoImagesOutline, IoSettingsOutline, IoLockClosedOutline, IoArrowBack, IoListOutline, IoSearchOutline, IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import {
  AdminDashboard,
  AdminProducts,
  AdminOrders,
  AdminCustomers,
  AdminCategories,
  AdminAnalytics,
  AdminSettings,
  AdminMedia,
  AdminBanners,
  AdminPages,
  AdminSeo,
  AdminCoupons,
} from "./AdminSections";
import { productAPI, orderAPI, authAPI } from "../../services/api";

const NAV_ITEMS = [
  { id: "dashboard",  icon: <IoGridOutline size={16} />, label: "Dashboard" },
  { id: "categories", icon: <IoGridOutline size={16} />, label: "Categories" },
  { id: "products",   icon: <IoCubeOutline size={16} />, label: "Products",  badgeKey: "products" },
  { id: "pages",      icon: <IoListOutline size={16} />, label: "Pages" },
  { id: "orders",     icon: <IoReceiptOutline size={16} />, label: "Orders",    badgeKey: "orders" },
  { id: "customers",  icon: <IoPeopleOutline size={16} />, label: "Customers", badgeKey: "customers" },
  { id: "banners",    icon: <IoImagesOutline size={16} />, label: "Banners" },
  { id: "coupons", icon: <IoReceiptOutline size={16} />, label: "Coupons & Gifts" },
  { id: "analytics", icon: <IoTrendingUpOutline size={16} />, label: "Analytics" },
  { id: "media",     icon: <IoImagesOutline size={16} />, label: "Media" },
  { id: "seo",      icon: <IoSearchOutline size={16} />, label: "SEO" },
  { id: "settings",  icon: <IoSettingsOutline size={16} />, label: "Settings" },
];

const AdminPanel = ({ navigate }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [section, setSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({ products: 0, orders: 0, customers: 0 });

  const fetchDynamicCounts = async () => {
    if (!user?.isAdmin) return;
    try {
      const [pRes, oRes, cRes] = await Promise.all([
        productAPI.getProducts({ limit: 1 }).catch(() => ({ total: 0 })),
        orderAPI.getAllOrders("All").catch(() => ({ total: 0 })),
        authAPI.getCustomers().catch(() => ({ users: [] }))
      ]);
      setCounts({
        products: pRes.total || pRes.products?.length || 0,
        orders: oRes.total || oRes.orders?.length || 0,
        customers: cRes.users?.length || cRes?.length || 0
      });
    } catch (err) {
      console.warn("Could not fetch sidebar counts");
    }
  };

  useEffect(() => {
    fetchDynamicCounts();
    const interval = setInterval(fetchDynamicCounts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  /* Access guard */
  if (!user?.isAdmin) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <span style={{ fontSize: 56, display: "flex", justifyContent: "center" }}><IoLockClosedOutline size={56} /></span>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 300,
            fontSize: 32,
          }}
        >
          Access Restricted
        </h2>
        <p style={{ color: "var(--muted)" }}>Admin credentials required</p>
        <Btn v="primary" onClick={() => navigate("/login")}>
          Sign In as Admin
        </Btn>
      </div>
    );
  }

  return (
    <div
      className="admin-layout"
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Mobile Header ──────────────────────────── */}
      <div className="admin-mobile-header" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 60,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "none", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", zIndex: 1000
      }}>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer" }}
        >
          <IoMenuOutline size={28} />
        </button>
        <span style={{ fontFamily: "Playfair Display", fontSize: 18, color: "var(--gold)" }}>Maison Élite</span>
        <div style={{ width: 28 }} /> {/* spacer */}
      </div>

      {/* ── Overlay for Mobile Sidebar ─────────────── */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
            backdropFilter: "blur(4px)", zIndex: 8000
          }}
        />
      )}
      {/* ── Sidebar ────────────────────────────────── */}
      <aside
        className={`admin-sidebar${isSidebarOpen ? " open" : ""}`}
        style={{
          width: 240,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 8001
        }}
      >
        {/* User header */}
        <div
          style={{
            padding: "24px 22px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 14,
            }}
          >
            Admin Console
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={user.name} size={34} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</p>
                <Tag color="gold">Admin</Tag>
              </div>
            </div>
            <button 
              className="mobile-only"
              onClick={() => setIsSidebarOpen(false)}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "none" }}
            >
              <IoCloseOutline size={24} />
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "16px 0", flex: 1 }}>
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              className={`side-btn${section === n.id ? " active" : ""}`}
              onClick={() => setSection(n.id)}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {n.icon}
              </span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badgeKey && counts[n.badgeKey] !== undefined && (
                <span
                  style={{
                    fontSize: 10,
                    background: "rgba(201,168,76,.2)",
                    color: "var(--gold)",
                    padding: "2px 7px",
                    borderRadius: 10,
                  }}
                >
                  {counts[n.badgeKey]}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Back to store */}
        <div
          style={{ padding: "16px 18px", borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border2)",
              borderRadius: 6,
              background: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              fontFamily: "'Jost', sans-serif",
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
            <IoArrowBack size={12} style={{ marginRight: 4 }} /> Back to Store
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          background: "var(--void)",
          padding: 36,
        }}
      >
        {section === "dashboard" && <AdminDashboard />}
        {section === "categories" && <AdminCategories />}
        {section === "products" && <AdminProducts />}
        {section === "orders" && <AdminOrders />}
        {section === "customers" && <AdminCustomers />}
        { section === "analytics" && <AdminAnalytics /> }
        { section === "media"     && <AdminMedia /> }
        { section === "banners"   && <AdminBanners /> }
        { section === "coupons"   && <AdminCoupons /> }
        { section === "pages"     && <AdminPages /> }
        { section === "seo"       && <AdminSeo /> }
        { section === "settings"  && <AdminSettings toast={toast} /> }
      </main>
    </div>
  );
};

export default AdminPanel;
