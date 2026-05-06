import { Navigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const links = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/products", label: "Products" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/coupons", label: "Coupons" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--void)", color: "var(--foreground)" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, borderRight: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", padding: "20px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px", marginBottom: 30 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: 0, color: "var(--gold)" }}>Admin Panel</h2>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {links.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink 
                key={link.path} 
                to={link.path} 
                style={{
                  padding: "12px 20px",
                  textDecoration: "none",
                  color: isActive ? "var(--gold)" : "var(--muted)",
                  background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--gold)" : "3px solid transparent",
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ height: 64, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", background: "rgba(255,255,255,0.01)" }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>
            {links.find(l => l.path === location.pathname)?.label || "Dashboard"}
          </h1>
          <div style={{ fontSize: 14 }}>
            <span style={{ color: "var(--muted)" }}>Logged in as: </span>
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>{user.name || user.fullName}</span>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: 30, overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;