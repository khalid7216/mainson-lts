import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { orderAPI, paymentAPI, wishlistAPI } from "../services/api";
import { Avatar, Btn, Tag, StatusTag } from "../components/UI";
import ProductCard, { QuickView } from "../components/ProductCard";
import { IoClose, IoArrowBack, IoCubeOutline, IoHeartOutline, IoLocationOutline, IoCardOutline } from "react-icons/io5";

const ProfilePage = ({ navigate, wishlist, toggleWishlist, addToCart }) => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [qv, setQv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // For receipt view
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (tab === "orders") {
      fetchOrders();
    } else if (tab === "wishlist") {
      fetchWishlist();
    }
  }, [user, tab, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistAPI.getWishlist();
      setWishlistItems(res.wishlist);
    } catch (err) {
      toast("Failed to fetch wishlist", "err");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getMyOrders();
      setOrders(data.orders);
    } catch (err) {
      toast(err.message || "Failed to fetch orders", "err");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    
    try {
      setCancellingId(order._id);
      
      // If payment was completed, use the refund route
      if (order.status === "paid") {
        await paymentAPI.refund(order._id, "Customer requested cancellation");
        toast("Order cancelled and refund initiated", "ok");
      } else {
        // Otherwise (pending/processing/COD), just cancel it normally
        await orderAPI.cancelOrder(order._id);
        toast("Order cancelled successfully", "ok");
      }

      // Close modal if open
      if (selectedOrder && selectedOrder._id === order._id) {
         setSelectedOrder(null);
      }
      
      // Refresh list
      fetchOrders();
    } catch (err) {
      toast(err.message || "Failed to cancel order", "err");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) return null;

  const TABS = [
    { id: "orders",    icon: <IoCubeOutline size={18} />, label: "Orders" },
    { id: "wishlist",  icon: <IoHeartOutline size={18} />, label: "Wishlist" },
    { id: "addresses", icon: <IoLocationOutline size={18} />, label: "Addresses" },
    { id: "payment",   icon: <IoCardOutline size={18} />, label: "Payment" },
  ];

  /* ── Full Screen Order Receipt Modal ───────────────── */
  if (selectedOrder) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "100px 32px 80px" }}>
        <button
          onClick={() => setSelectedOrder(null)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", marginBottom: 32 }}
        >
          <IoArrowBack size={16} /> Back to Orders
        </button>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "32px 40px", borderBottom: "1px dashed var(--border2)", background: "var(--lift)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 300, marginBottom: 8 }}>
                    Order Receipt
                  </h1>
                  <p style={{ color: "var(--gold2)", fontWeight: 500, letterSpacing: "1px" }}>
                    {selectedOrder.orderId || `#ME-${selectedOrder._id.slice(-6).toUpperCase()}`}
                  </p>
                </div>
                <StatusTag status={selectedOrder.status} />
             </div>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontSize: 13, color: "var(--muted)" }}>
               <div>
                 <p style={{ marginBottom: 4 }}><span style={{ color: "var(--dim)" }}>Date Placed</span></p>
                 <p style={{ color: "var(--text)" }}>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
               </div>
               <div>
                 <p style={{ marginBottom: 4 }}><span style={{ color: "var(--dim)" }}>Shipping Details</span></p>
                 <p style={{ color: "var(--text)" }}>Deliver to Address (Checkout)</p>
               </div>
             </div>
          </div>

          <div style={{ padding: "32px 40px" }}>
             <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 20, color: "var(--dim)" }}>ITEMS ORDERED</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               {selectedOrder.items.map((item, idx) => (
                 <div key={idx} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                   <div style={{ width: 48, height: 60, borderRadius: 6, overflow: "hidden", background: "var(--lift)", border: "1px solid var(--border2)" }}>
                      <img src={item.image?.url || item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                     <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                   </div>
                   <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gold2)" }}>
                     ${(item.qty * item.price).toFixed(2)}
                   </p>
                 </div>
               ))}
             </div>

             <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border2)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)" }}>
                  <span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)" }}>
                  <span>Tax (8%)</span><span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)" }}>
                  <span>Shipping</span><span>{selectedOrder.shippingCost === 0 ? "Free" : `$${selectedOrder.shippingCost.toFixed(2)}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 600, marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <span>Total</span><span style={{ color: "var(--gold2)" }}>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
             </div>

             <div style={{ marginTop: 40, textAlign: "center", color: "var(--dim)", fontSize: 13, fontStyle: "italic" }}>
               Thank you for shopping with Maison Élite.
             </div>

              {/* Show Cancel Option if applicable */}
             {["pending", "processing", "paid"].includes(selectedOrder.status) && (
                <div style={{ marginTop: 32, textAlign: "center" }}>
                   <button 
                     onClick={() => handleCancelOrder(selectedOrder)}
                     disabled={cancellingId === selectedOrder._id}
                     style={{
                       background: "none", border: "none", color: "var(--rose)", fontSize: 13,
                       textDecoration: "underline", cursor: "pointer", opacity: cancellingId === selectedOrder._id ? 0.5 : 1
                     }}
                   >
                     {cancellingId === selectedOrder._id ? "Cancelling..." : "Cancel Order"}
                   </button>
                </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Profile View ───────────────────────────── */
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 32px 60px" }}>
      {qv && (
        <QuickView
          product={qv}
          onClose={() => setQv(null)}
          addToCart={addToCart}
        />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 48 }} className="grid-1-mobile">

        {/* ── Sidebar ─────────────────────────────── */}
        <div>
          {/* Profile card */}
          <div style={{
            textAlign: "center", padding: "28px 20px",
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
            marginBottom: 16,
          }}>
            <Avatar name={user.name} size={64} style={{ margin: "0 auto" }} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", borderRadius: 8,
                  background: tab === t.id ? "var(--lift)" : "transparent",
                  border: "1px solid",
                  borderColor: tab === t.id ? "var(--border)" : "transparent",
                  color: tab === t.id ? "var(--text)" : "var(--muted)",
                  fontSize: 14, fontWeight: tab === t.id ? 500 : 400,
                  cursor: "pointer", transition: "all .2s",
                  textAlign: "left"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, opacity: tab === t.id ? 1 : 0.6 }}>
                  {t.icon}
                </div> 
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ──────────────────────────────── */}
        <div className="fu" style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 300, marginBottom: 8, textTransform: "capitalize" }}>
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>
            {tab === "orders"
              ? `${orders.length} total orders`
              : `Manage your ${tab}`}
          </p>

          {/* Orders list */}
          {tab === "orders" && (
            loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <div style={{ marginBottom: 16, opacity: .3, display: 'flex', justifyContent: 'center' }}>
                  <IoCubeOutline size={48} />
                </div>
                <p style={{ color: "var(--muted)", marginBottom: 24 }}>You haven't placed any orders yet.</p>
                <Btn v="primary" onClick={() => navigate("/")}>Start Shopping</Btn>
              </div>
            ) : (
              orders.map((o, i) => (
                <div
                  key={o._id}
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
                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gold2)" }}>{o.orderId || `#ME-${o._id.slice(-6).toUpperCase()}`}</p>
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>
                        {new Date(o.createdAt).toLocaleDateString()} · {o.items.reduce((sum, item) => sum + item.qty, 0)} items
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 300 }}>
                        ${o.totalAmount.toFixed(2)}
                      </p>
                      <div style={{ marginTop: 6 }}>
                        <StatusTag status={o.status} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div style={{ marginTop: 20, display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                    {o.items.map((item, idx) => (
                      <div key={idx} style={{ flexShrink: 0, width: 48, height: 60, borderRadius: 6, overflow: "hidden", background: "var(--lift)", border: "1px solid var(--border2)" }}>
                        <img src={item.image?.url || item.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100"} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Btn v="ghost" size="sm" onClick={() => setSelectedOrder(o)}>View Receipt</Btn>
                    
                    {["pending", "processing", "paid"].includes(o.status) && (
                      <button 
                        onClick={() => handleCancelOrder(o)}
                        disabled={cancellingId === o._id}
                        style={{
                          background: "none", border: "none", color: "var(--rose)", fontSize: 12,
                          cursor: "pointer", opacity: cancellingId === o._id ? 0.5 : 1
                        }}
                      >
                         {cancellingId === o._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* Wishlist list */}
          {tab === "wishlist" && (
            loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
                Loading wishlist...
              </div>
            ) : wishlistItems.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <div style={{ marginBottom: 16, opacity: .3, display: 'flex', justifyContent: 'center' }}>
                  <IoHeartOutline size={48} />
                </div>
                <p style={{ color: "var(--muted)", marginBottom: 24 }}>No wishlist saved yet</p>
                <Btn v="primary" onClick={() => navigate("/")}>Browse Collection</Btn>
              </div>
            ) : (
              <div className="prod-grid-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))", gap: 28 }}>
                {wishlistItems.map((item, i) => {
                  const p = item.product;
                  if (!p) return null; // in case product was deleted
                  const formattedProduct = {
                    id: p._id,
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    orig: p.compareAtPrice,
                    cat: p.parentCategory?.name || "Uncategorized",
                    badge: p.badge,
                    rating: p.ratings?.length ? p.ratings : Number((4 + Math.random()).toFixed(1)),
                    reviews: Math.floor(Math.random() * 150) + 10,
                    image: p.images?.[0] || p.image?.url || p.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
                  };

                  return (
                    <ProductCard
                      key={formattedProduct.id}
                      product={formattedProduct}
                      navigate={navigate}
                      addToCart={addToCart}
                      wishlist={wishlist}
                      toggleWishlist={async (id) => {
                         await toggleWishlist(id);
                         fetchWishlist();
                      }}
                      onQuickView={() => setQv(formattedProduct)}
                      delay={i * 0.05}
                    />
                  );
                })}
              </div>
            )
          )}

          {/* Empty states for other tabs */}
          {tab !== "orders" && tab !== "wishlist" && (
            <div style={{ padding: "60px 0", textAlign: "center", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ marginBottom: 16, opacity: .3, display: 'flex', justifyContent: 'center' }}>
                {
                  TABS.find((t) => t.id === tab)?.id === "addresses" ? <IoLocationOutline size={48} /> :
                  <IoCardOutline size={48} />
                }
              </div>
              <p style={{ color: "var(--muted)", marginBottom: 24 }}>
                No {tab} saved yet
              </p>
              <Btn v="ghost">+ Add {tab === "addresses" ? "Address" : "Payment Method"}</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
