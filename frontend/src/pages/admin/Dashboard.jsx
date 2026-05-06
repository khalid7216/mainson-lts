import { useState, useEffect } from "react";
import { getAnalytics } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const toast = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await getAnalytics();
      // Handle nested response format: res.data || res
      setData(res.data || res);
    } catch (err) {
      console.error(err);
      setError(true);
      toast("Failed to load analytics", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 100, background: "rgba(255,255,255,0.05)", borderRadius: 6, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "#c0392b", marginBottom: 16 }}>Failed to load analytics</p>
        <button onClick={fetchAnalytics} style={{ padding: "10px 20px", background: "var(--gold)", color: "#000", border: "none", cursor: "pointer", fontWeight: 600 }}>
          Retry
        </button>
      </div>
    );
  }

  const { totalRevenue = 0, totalOrders = 0, totalProducts = 0, totalUsers = 0, recentOrders = [], topProducts = [] } = data;

  const MetricCard = ({ title, value }) => (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 20, borderRadius: 6 }}>
      <h3 style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 10px 0", fontWeight: 500 }}>{title}</h3>
      <p style={{ fontSize: 28, margin: 0, color: "var(--gold)", fontWeight: 600 }}>{value}</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <MetricCard title="Total Revenue" value={"$" + totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
        <MetricCard title="Total Orders" value={totalOrders.toLocaleString()} />
        <MetricCard title="Total Products" value={totalProducts.toLocaleString()} />
        <MetricCard title="Total Users" value={totalUsers.toLocaleString()} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
        {/* Recent Orders */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 20, borderRadius: 6 }}>
          <h3 style={{ fontSize: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10, margin: "0 0 15px 0" }}>Recent Orders</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                <th style={{ paddingBottom: 10 }}>Order ID</th>
                <th style={{ paddingBottom: 10 }}>Customer</th>
                <th style={{ paddingBottom: 10 }}>Amount</th>
                <th style={{ paddingBottom: 10 }}>Status</th>
                <th style={{ paddingBottom: 10 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id || order.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 0" }}>{(order._id || order.id).slice(-6)}</td>
                  <td style={{ padding: "12px 0" }}>{order.user?.name || "Guest"}</td>
                  <td style={{ padding: "12px 0", color: "var(--gold)" }}>${(order.totalAmount || 0).toFixed(2)}</td>
                  <td style={{ padding: "12px 0" }}>{order.status}</td>
                  <td style={{ padding: "12px 0", color: "var(--muted)" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan="5" style={{ padding: "12px 0", textAlign: "center", color: "var(--muted)" }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 20, borderRadius: 6 }}>
          <h3 style={{ fontSize: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10, margin: "0 0 15px 0" }}>Top Products</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                <th style={{ paddingBottom: 10 }}>Product Name</th>
                <th style={{ paddingBottom: 10 }}>Total Sold</th>
                <th style={{ paddingBottom: 10 }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(product => (
                <tr key={product._id || product.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 0" }}>{product.name}</td>
                  <td style={{ padding: "12px 0" }}>{product.sold || 0}</td>
                  <td style={{ padding: "12px 0", color: "var(--gold)" }}>${((product.sold || 0) * (product.price || 0)).toFixed(2)}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr><td colSpan="3" style={{ padding: "12px 0", textAlign: "center", color: "var(--muted)" }}>No product data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;