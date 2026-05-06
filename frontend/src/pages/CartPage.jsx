import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Btn } from "../components/UI";
import { IoBagOutline, IoTrashOutline } from "react-icons/io5";
import SEO from "../components/SEO";

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, isLoading, totalItems, totalPrice, updateItem, removeItem } = useCart();

  const handleUpdateQty = (productId, newQty) => {
    if (newQty < 1) return;
    updateItem(productId, newQty);
  };

  const handleRemove = (productId, name) => {
    if (window.confirm('Remove ' + (name) + ' from your cart?')) {
      removeItem(productId);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) return navigate("/login");
    navigate("/checkout");
  };

  const shipping = totalPrice >= 200 || totalPrice === 0 ? 0 : 15;
  const finalTotal = totalPrice + shipping;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(80px, 12vh, 120px) clamp(16px, 5vw, 32px) 80px" }}>
      <SEO pageName="cart" />
      
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 300, marginBottom: 12 }}>
          Shopping Bag
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          {totalItems} items
        </p>
      </div>

      {isLoading && cartItems.length === 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 48 }} className="grid-1-mobile">
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 160, background: "var(--lift)", borderRadius: 8, marginBottom: 24, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
          <div>
            <div style={{ height: 300, background: "var(--lift)", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="fu" style={{ textAlign: "center", padding: "100px 0" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--lift)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontSize: 48 }}>
            <IoBagOutline size={48} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 12 }}>
            Your Bag is Empty
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: 14 }}>
            Discover our curated collection of timeless pieces
          </p>
          <Btn v="primary" size="lg" onClick={() => navigate("/shop")}>
            Explore Collection
          </Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 48 }} className="grid-1-mobile">
          
          {/* Cart items list */}
          <div>
            {cartItems.map((item, i) => {
              const p = item.product || {};
              const imageUrl = Array.isArray(p.images) && p.images.length > 0 
                ? p.images[0] 
                : "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80";

              return (
                <div key={item._id || i} className="fu flex-wrap" style={{ display: "flex", gap: 22, padding: "24px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                  <div style={{ width: 96, height: 114, borderRadius: 8, flexShrink: 0, background: "var(--lift)", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <img src={imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 300, marginBottom: 6 }}>
                      {p.name}
                    </h3>
                    <p style={{ color: "var(--dim)", fontSize: 12 }}>
                      ${p.price?.toFixed(2)}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button 
                      onClick={() => item.quantity === 1 ? handleRemove(p._id, p.name) : handleUpdateQty(p._id, item.quantity - 1)}
                      disabled={isLoading}
                      style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: isLoading ? "not-allowed" : "pointer" }}
                    >−</button>
                    
                    <span style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                    
                    <button 
                      onClick={() => handleUpdateQty(p._id, item.quantity + 1)}
                      disabled={isLoading}
                      style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--border2)", background: "none", color: "var(--text)", cursor: isLoading ? "not-allowed" : "pointer" }}
                    >+</button>
                  </div>

                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <p style={{ fontSize: 16, fontFamily: "'Jost', sans-serif" }}>${((p.price || 0) * item.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => handleRemove(p._id, p.name)}
                      disabled={isLoading}
                      style={{ background: "none", border: "none", color: "var(--dim)", cursor: isLoading ? "not-allowed" : "pointer", marginTop: 8 }}
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar / Checkout Summary */}
          <div>
            <div style={{ background: "var(--lift)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, position: "sticky", top: 120 }}>
              <h2 style={{ fontSize: 16, textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 24 }}>Order Summary</h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14, color: "var(--muted)" }}>
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 14, color: "var(--muted)" }}>
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : '$' + (shipping.toFixed(2))}</span>
              </div>
              
              <div style={{ height: 1, background: "var(--border2)", marginBottom: 24 }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, fontSize: 20, fontFamily: "'Playfair Display', serif" }}>
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              <Btn 
                v="primary" 
                full 
                size="lg" 
                onClick={handleCheckout}
                disabled={isLoading}
              >
                Checkout - ${finalTotal.toFixed(2)}
              </Btn>

              <p style={{ fontSize: 11, color: "var(--dim)", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
                Shipping & taxes calculated at checkout.<br/>
                Complimentary shipping on orders over $200.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;
