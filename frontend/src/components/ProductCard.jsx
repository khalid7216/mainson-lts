import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";
import { Btn, StatusTag } from "./UI";
import { IoStar, IoHeartOutline, IoHeart, IoClose, IoSearchOutline } from "react-icons/io5";

const ProductCard = ({ product, delay = 0, onQuickView }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);

  const outOfStock = product.stock === 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate("/login");

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, 1);
      if (toast && typeof toast === "function") {
        toast("Added to cart!", "ok");
      }
    } catch (err) {
      if (toast && typeof toast === "function") {
        toast(err.response?.data?.message || "Error adding to cart", "err");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate("/login");

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(product._id);
        setIsWishlisted(true);
      }
    } catch (err) {
      if (toast && typeof toast === "function") {
        toast("Failed to update wishlist", "err");
      }
    }
  };

  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80";

  const ratingVal = product.ratings?.average || 0;

  return (
    <div
      className="prod-card lift"
      onClick={() => navigate('/product/' + (product.slug))}
      style={{
        animationDelay: (delay) + 's',
        animationFillMode: "both",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Image box */}
      <div className="prod-img" style={{ height: 340, background: "var(--lift)", overflow: "hidden", position: "relative" }}>
        <img
          src={product.image?.url || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          onError={(e) => (e.target.src = '/placeholder.jpg')}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transition: "transform .5s ease",
            opacity: outOfStock ? 0.5 : 1
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />

        {outOfStock && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.7)", color: "white", padding: "8px 16px", borderRadius: 4, fontWeight: "bold", zIndex: 2 }}>
            OUT OF STOCK
          </div>
        )}

        {/* Wishlist toggle */}
        <button
          onClick={handleToggleWishlist}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: isWishlisted ? "rgba(201,168,76,.3)" : "rgba(0,0,0,.5)",
            border: '1px solid ' + (isWishlisted ? "var(--gold)" : "rgba(255,255,255,0.2)"),
            color: isWishlisted ? "var(--gold)" : "white",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .25s",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            zIndex: 3
          }}
        >
          {isWishlisted ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
        </button>

        {/* Hover overlay for Add to Cart & Quick View */}
        <div className="prod-overlay hide-mobile" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, opacity: 0, transition: "0.3s", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", display: "flex", gap: 8 }}>
          <Btn 
            v="primary" 
            style={{ flex: 1 }}
            onClick={handleAddToCart}
            disabled={outOfStock || isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
          </Btn>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(); }}
            style={{
              width: 44, height: 44, borderRadius: 8, background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)", color: "white", display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)"
            }}
          >
            <IoSearchOutline size={18} />
          </button>
        </div>
      </div>

      {/* Info box */}
      <div style={{ padding: "20px 0 10px", display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
          {product.category?.name || product.category || "Uncategorized"}
        </p>
        
        <h3 style={{ fontSize: 16, fontWeight: 400, marginBottom: 8, lineHeight: 1.4 }}>
          {product.name}
        </h3>

        {/* Price & Rating */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <span style={{ fontSize: 15, fontWeight: 500, fontFamily: "'Jost', sans-serif" }}>
            {priceFormatted}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <IoStar size={12} color={ratingVal > 0 ? "var(--gold)" : "var(--dim)"} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {ratingVal.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Mobile Add to cart (visible only on mobile) */}
        <div className="show-mobile" style={{ marginTop: 16 }}>
          <Btn 
            v="outline" 
            full 
            onClick={handleAddToCart}
            disabled={outOfStock || isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

/* -- Quick View Modal -------------------------------- */
export const QuickView = ({ product, onClose, addToCart }) => {
  if (!product) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)"
    }}>
      <div 
        onClick={onClose}
        style={{ position: "absolute", inset: 0 }}
      />
      
      <div className="fu glass" style={{
        position: "relative", width: "100%", maxWidth: 1000,
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 16, overflow: "hidden", display: "grid",
        gridTemplateColumns: "1fr 1fr", animation: "slideUp .4s ease"
      }}>
        {/* Left: Image */}
        <div style={{ height: 600, background: "var(--lift)" }}>
          <img 
            src={product.image?.url || product.image} 
            alt={product.name} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Right: Info */}
        <div style={{ padding: 60, display: "flex", flexDirection: "column" }}>
          <button 
            onClick={onClose}
            style={{ 
              position: "absolute", top: 30, right: 30, 
              background: "none", border: "none", color: "var(--dim)", 
              cursor: "pointer", padding: 10 
            }}
          >
            <IoClose size={24} />
          </button>

          <p style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
            {product.cat || "Collection"}
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 300, marginBottom: 20 }}>
            {product.name}
          </h2>
          <p style={{ fontSize: 24, fontWeight: 300, marginBottom: 32, color: "var(--gold2)" }}>
            ${product.price?.toFixed(2)}
          </p>
          
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8, marginBottom: 40 }}>
            Elevate your wardrobe with this carefully crafted piece. Designed for the modern woman who values both style and comfort.
          </p>

          <div style={{ marginTop: "auto" }}>
            <Btn v="primary" full size="lg" onClick={() => { addToCart(product); onClose(); }}>
              Add to Bag - ${product.price?.toFixed(2)}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
