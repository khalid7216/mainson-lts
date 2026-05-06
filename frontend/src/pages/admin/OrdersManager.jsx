import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const filters = { page, limit: 20 };
      if (statusFilter !== "all") filters.status = statusFilter;
      
      const res = await getAllOrders(filters);
      setOrders(res.orders || res.data || []);
      setTotalPages(res.pages || res.totalPages || 1);
    } catch (err) {
      toast("Failed to load orders", "err");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast("Order status updated", "ok");
      fetchOrders();
    } catch (err) {
      toast("Failed to update status", "err");
    }
  };

  const statuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return 'yellow';
    if (s === 'processing') return '#3498db';
    if (s === 'shipped') return '#9b59b6';
    if (s === 'delivered') return '#2ecc71';
    if (s === 'cancelled') return '#e74c3c';
    return 'var(--muted)';
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Orders Manager</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: 10 }}>
        {statuses.map(status => {
          const value = status.toLowerCase();
          const isActive = statusFilter === value || (statusFilter === "all" && value === "all");
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(value); setPage(1); }}
              style={{
                padding: "8px 16px",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "var(--gold)" : "var(--muted)",
                border: "1px solid",
                borderColor: isActive ? "var(--gold)" : "var(--border)",
                borderRadius: 20,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {status}
            </button>
          );
        })}
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--muted)" }}>
              <th style={{ padding: 15 }}>Order ID</th>
              <th style={{ padding: 15 }}>Customer</th>
              <th style={{ padding: 15 }}>Items</th>
              <th style={{ padding: 15 }}>Total</th>
              <th style={{ padding: 15 }}>Status</th>
              <th style={{ padding: 15 }}>Date</th>
              <th style={{ padding: 15 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="7" style={{ padding: 20, textAlign: "center" }}>Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: 20, textAlign: "center" }}>No orders found</td></tr>
            ) : (
              orders.map(order => (
                <React.Fragment key={order._id || order.id}>
                  <tr style={{ borderTop: "1px solid var(--border)", background: expandedOrder === (order._id || order.id) ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <td style={{ padding: 15 }}>{(order._id || order.id).slice(-8)}</td>
                    <td style={{ padding: 15 }}>{order.user?.name || "Guest"}</td>
                    <td style={{ padding: 15 }}>{order.items?.length || 0}</td>
                    <td style={{ padding: 15, color: "var(--gold)" }}>${(order.totalAmount || 0).toFixed(2)}</td>
                    <td style={{ padding: 15 }}>
                      <select 
                        value={order.status?.toLowerCase() || 'pending'} 
                        onChange={(e) => handleStatusChange(order._id || order.id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          background: "transparent",
                          color: getStatusColor(order.status),
                          border: '1px solid ' + (getStatusColor(order.status)),
                          borderRadius: 4,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        <option value="pending" style={{ color: "#000" }}>Pending</option>
                        <option value="processing" style={{ color: "#000" }}>Processing</option>
                        <option value="shipped" style={{ color: "#000" }}>Shipped</option>
                        <option value="delivered" style={{ color: "#000" }}>Delivered</option>
                        <option value="cancelled" style={{ color: "#000" }}>Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: 15, color: "var(--muted)" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: 15 }}>
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === (order._id || order.id) ? null : (order._id || order.id))}
                        style={{ padding: "6px 12px", background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer" }}
                      >
                        {expandedOrder === (order._id || order.id) ? "Hide Details" : "View Details"}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row Content */}
                  {expandedOrder === (order._id || order.id) && (
                    <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                      <td colSpan="7" style={{ padding: 20 }}>
                        <div style={{ display: "flex", gap: 40 }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ color: "var(--gold)", marginBottom: 10 }}>Items Ordered</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {order.items?.map((item, idx) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                  <span>{item.quantity}x {item.product?.name || "Product"}</span>
                                  <span>${((item.product?.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ color: "var(--gold)", marginBottom: 10 }}>Shipping Details</h4>
                            {order.shippingAddress ? (
                              <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
                                <p>{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                                <p>Phone: {order.shippingAddress.phone}</p>
                              </div>
                            ) : (
                              <span style={{ color: "var(--muted)" }}>No shipping info</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", cursor: page === 1 ? "not-allowed" : "pointer" }}>Prev</button>
          <span style={{ padding: "8px 0" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next</button>
        </div>
      )}
    </div>
  );
};

// Need this to use React.Fragment inside the component locally
import React from "react";
export default OrdersManager;