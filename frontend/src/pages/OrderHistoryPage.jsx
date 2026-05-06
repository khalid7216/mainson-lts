import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, getOrderById } from "../services/orderService";
import { useToast } from "../context/ToastContext";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        // Assume API returns { orders: [] } or just []
        setOrders(data.orders || data || []);
      } catch (err) {
        toast("Failed to load your orders", "err");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [toast]);

  const toggleDetails = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    
    setExpandedOrder(orderId);
    setDetailsLoading(true);
    try {
      const data = await getOrderById(orderId);
      // Assume API returns { order: { ... } } or just { ... }
      setOrderDetails(data.order || data);
    } catch (err) {
      toast("Failed to load order details", "err");
      setExpandedOrder(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return 'yellow';
    if (s === 'processing') return '#3498db'; // blue
    if (s === 'shipped') return '#9b59b6'; // purple
    if (s === 'delivered') return '#2ecc71'; // green
    if (s === 'cancelled') return '#e74c3c'; // red
    return 'var(--muted)';
  };

  if (loading) {
    return (
      <div style={{ padding: "120px 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 30 }}>My Orders</h2>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 80, background: "rgba(255,255,255,0.05)", marginBottom: 16, borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: "140px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 16 }}>
          No orders yet
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>You haven't placed any orders.</p>
        <Link to="/shop" style={{ padding: "12px 24px", background: "var(--gold)", color: "#000", textDecoration: "none", display: "inline-block", fontWeight: 600 }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "120px 20px 60px", maxWidth: 1000, margin: "0 auto", color: "var(--foreground)" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 30 }}>My Orders</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((order) => (
          <div key={order._id || order.id} style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Order #{order._id || order.id}</p>
                <p>{new Date(order.createdAt || order.date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <span style={{ 
                  padding: "4px 10px", 
                  borderRadius: 12, 
                  fontSize: 12, 
                  fontWeight: 600,
                  color: "#000",
                  background: getStatusColor(order.status)
                }}>
                  {(order.status || 'Pending').toUpperCase()}
                </span>
              </div>
              
              <div>
                <p style={{ fontSize: 18, fontWeight: 600 }}>${(order.totalAmount || order.totalPrice || 0).toFixed(2)}</p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>{order.items?.length || 0} items</p>
              </div>
              
              <button 
                onClick={() => toggleDetails(order._id || order.id)}
                style={{ padding: "8px 16px", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", cursor: "pointer" }}
              >
                View Details
              </button>
            </div>
            
            {expandedOrder === (order._id || order.id) && (
              <div style={{ borderTop: "1px solid var(--border)", padding: 20, background: "rgba(0,0,0,0.2)" }}>
                {detailsLoading ? (
                  <p style={{ color: "var(--muted)" }}>Loading details...</p>
                ) : orderDetails ? (
                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16, fontSize: 18 }}>Items</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                      {orderDetails.items?.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span>{item.quantity}x {item.product?.name || "Product"}</span>
                          <span>${((item.product?.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                      <div>
                        <h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 10, fontSize: 16, color: "var(--gold)" }}>Shipping To</h4>
                        {orderDetails.shippingAddress ? (
                          <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
                            <p>{orderDetails.shippingAddress.fullName}</p>
                            <p>{orderDetails.shippingAddress.address}</p>
                            <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}</p>
                            <p>{orderDetails.shippingAddress.country}</p>
                            <p>Phone: {orderDetails.shippingAddress.phone}</p>
                          </div>
                        ) : (
                          <p style={{ fontSize: 14, color: "var(--muted)" }}>No shipping info available.</p>
                        )}
                      </div>
                      
                      <div>
                         <h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 10, fontSize: 16, color: "var(--gold)" }}>Payment</h4>
                         <p style={{ fontSize: 14, color: "var(--muted)" }}>
                            Method: Card<br/>
                            Status: Paid<br/>
                            ID: <span style={{ fontSize: 11 }}>{orderDetails.paymentIntentId || "N/A"}</span>
                         </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)" }}>Could not load order details.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage;