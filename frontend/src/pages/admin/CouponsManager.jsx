import { useState, useEffect } from "react";
import { getAllCoupons, createCoupon, deleteCoupon } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";

const CouponsManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ code: "", discountPercent: "", expiryDate: "", minOrderAmount: "" });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await getAllCoupons();
      setCoupons(res.coupons || res.data || []);
    } catch (err) {
      toast("Failed to load coupons", "err");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      toast("Coupon deleted", "ok");
      fetchCoupons();
    } catch (err) {
      toast("Failed to delete coupon", "err");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCoupon(formData);
      toast("Coupon created", "ok");
      setFormData({ code: "", discountPercent: "", expiryDate: "", minOrderAmount: "" });
      fetchCoupons();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to create coupon", "err");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Coupons Manager</h2>

      {/* Create Form */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 24, marginBottom: 30, borderRadius: 6 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 18 }}>Create New Coupon</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 14 }}>Code</label>
            <input required placeholder="e.g. SUMMER20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{ width: "100%", padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff", textTransform: "uppercase" }} />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 14 }}>Discount (%)</label>
            <input required type="number" min="1" max="100" placeholder="20" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} style={{ width: "100%", padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 14 }}>Expiry Date</label>
            <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} style={{ width: "100%", padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 14 }}>Min Order ($)</label>
            <input type="number" placeholder="50" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} style={{ width: "100%", padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
          </div>
          <div style={{ flex: "1 1 100px" }}>
            <button type="submit" disabled={submitting} style={{ width: "100%", padding: 12, background: "var(--gold)", color: "#000", border: "none", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {submitting ? "Adding..." : "Add Coupon"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--muted)" }}>
              <th style={{ padding: 15 }}>Code</th>
              <th style={{ padding: 15 }}>Discount</th>
              <th style={{ padding: 15 }}>Min Order</th>
              <th style={{ padding: 15 }}>Expiry Date</th>
              <th style={{ padding: 15 }}>Active</th>
              <th style={{ padding: 15 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ padding: 20, textAlign: "center" }}>Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: 20, textAlign: "center" }}>No coupons found</td></tr>
            ) : (
              coupons.map(c => {
                const isExpired = new Date(c.expiryDate) < new Date();
                return (
                  <tr key={c._id || c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 15, fontWeight: 600, color: "var(--gold)" }}>{c.code}</td>
                    <td style={{ padding: 15 }}>{c.discountPercent}%</td>
                    <td style={{ padding: 15 }}>${c.minOrderAmount || 0}</td>
                    <td style={{ padding: 15, color: isExpired ? "#c0392b" : "inherit" }}>
                      {new Date(c.expiryDate).toLocaleDateString()} {isExpired && "(Expired)"}
                    </td>
                    <td style={{ padding: 15 }}>
                      <span style={{ color: c.isActive && !isExpired ? "#2ecc71" : "#e74c3c" }}>
                        {c.isActive && !isExpired ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ padding: 15 }}>
                      <button onClick={() => handleDelete(c._id || c.id)} style={{ padding: "6px 12px", background: "transparent", color: "#c0392b", border: "1px solid #c0392b", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponsManager;