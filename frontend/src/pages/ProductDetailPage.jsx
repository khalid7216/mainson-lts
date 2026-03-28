// frontend/src/pages/ProductDetailPage.jsx
// ═════════════════════════════════════════════════════════════
//  UPDATED: Changed from id to slug
// ═════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Btn, StatusTag } from "../components/UI";
import { productAPI } from "../services/api";
import { HiStar, HiHeart, HiShoppingBag, HiCheck } from "react-icons/hi";
import { IoArrowBack } from "react-icons/io5";
import Breadcrumbs from "../components/Breadcrumbs";

const ProductDetailPage = ({ navigate, addToCart, wishlist, toggleWishlist }) => {
  const { slug } = useParams();  // ✅ CHANGED: id → slug
  const toast = useToast();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Variants derived state
  const urlColor = searchParams.get("color");
  const urlSize = searchParams.get("size");
  const [selectedColor, setSelectedColor] = useState(urlColor || null);
  const [selectedSize, setSelectedSize] = useState(urlSize || null);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getProduct(slug);
        const p = data.product;
        setProduct({
          id: p._id,
          name: p.name,
          slug: p.slug,
          description: p.description || "Crafted from the finest materials, this piece embodies timeless elegance.",
          price: p.price,
          orig: p.compareAtPrice,
          cat: p.parentCategory?.name || "Uncategorized",
          badge: p.badge,
          rating: data.avgRating || 4.5,
          reviews: data.numReviews || 0,
          image: p.images?.[0] || p.image?.url || p.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
          images: p.images?.length ? p.images : ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80"],
          variants: p.variants || [],
          materials: p.materials || "100% Premium Material",
          care: p.careInstructions || "Follow label instructions",
          madeIn: p.madeIn || "Unknown",
          sku: `ME-${p._id.substring(p._id.length - 4)}`
        });
        
        // Default to first available variant if none selected
        if (p.variants?.length > 0) {
          const first = p.variants[0];
          if (!urlColor) setSelectedColor(first.color);
          if (!urlSize) setSelectedSize(first.size);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);  // ✅ CHANGED: id → slug

  /* ── SEO: Inject JSON-LD structured data ──────── */
  useEffect(() => {
    if (!product) return;
    
    // Product schema
    const productLD = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: product.image,
      description: `Crafted from the finest materials, ${product.name} embodies timeless elegance.`,
      brand: { "@type": "Brand", name: "Maison Élite" },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: product.price ? product.price.toFixed(2) : "0.00",
        availability: "https://schema.org/InStock",
      },
      ...(product.rating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: String(product.rating),
          reviewCount: String(product.reviews || 0),
        },
      }),
    };

    // Breadcrumb schema
    const breadcrumbLD = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin + "/" },
        { "@type": "ListItem", position: 2, name: product.cat || "Collection", item: window.location.origin + "/category/" + (product.cat || "all").toLowerCase() },
        { "@type": "ListItem", position: 3, name: product.name },
      ],
    };

    const scriptProduct = document.createElement("script");
    scriptProduct.type = "application/ld+json";
    scriptProduct.id   = "ld-product";
    scriptProduct.textContent = JSON.stringify(productLD);

    const scriptBreadcrumb = document.createElement("script");
    scriptBreadcrumb.type = "application/ld+json";
    scriptBreadcrumb.id   = "ld-breadcrumb";
    scriptBreadcrumb.textContent = JSON.stringify(breadcrumbLD);

    // Remove old if re-render
    document.getElementById("ld-product")?.remove();
    document.getElementById("ld-breadcrumb")?.remove();

    document.head.appendChild(scriptProduct);
    document.head.appendChild(scriptBreadcrumb);

    return () => {
      document.getElementById("ld-product")?.remove();
      document.getElementById("ld-breadcrumb")?.remove();
    };
  }, [product]);

  // Sync params when state changes
  useEffect(() => {
    if (selectedColor || selectedSize) {
      const p = {};
      if (selectedColor) p.color = selectedColor;
      if (selectedSize) p.size = selectedSize;
      setSearchParams(p, { replace: true });
    }
  }, [selectedColor, selectedSize, setSearchParams]);

  if (loading) {
    return (
      <div style={{ padding: "120px 32px", textAlign: "center" }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "120px 32px", textAlign: "center" }}>
        <h2>Product not found</h2>
        <Btn v="primary" onClick={() => navigate("/")}>
          Back to Home
        </Btn>
      </div>
    );
  }

  const isWished = wishlist?.includes(product.id);
  
  // Extract variants options
  const variants = product.variants || [];
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  
  // Find current active variant
  const activeVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
  const isOutOfStock = activeVariant ? activeVariant.stock <= 0 : false;
  const currentPrice = activeVariant?.price || product.price;


  // Use images from response or mock fallback
  const images = product.images?.length >= 3 
    ? product.images 
    : [product.image?.url || product.image, product.image?.url || product.image, product.image?.url || product.image];

  const handleAddToCart = () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast("Please select a size", "err");
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      toast("Please select a color", "err");
      return;
    }
    if (isOutOfStock) {
      toast("This variant is currently out of stock", "err");
      return;
    }
    addToCart({ ...product, selectedColor, selectedSize, price: currentPrice });
    toast(`${product.name} added to cart`, "ok");
  };

  return (
    <div style={{ padding: "clamp(80px, 12vh, 100px) 0 80px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px)" }}>
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            color: "var(--muted)",
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 32,
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
        >
          <IoArrowBack size={16} /> Back to Collection
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
          }}
          className="grid-1-mobile"
        >
          {/* Left: Images */}
          <div>
            {/* Main image */}
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: 12,
                overflow: "hidden",
                background: "var(--lift)",
                marginBottom: 16,
              }}
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Thumbnail gallery */}
            <div style={{ display: "flex", gap: 12 }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: 80,
                    height: 100,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--lift)",
                    border: `2px solid ${
                      activeImage === i ? "var(--gold)" : "var(--border)"
                    }`,
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div>
            {/* Breadcrumb */}
            <Breadcrumbs />

            {/* Title */}
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 38,
                fontWeight: 300,
                marginBottom: 16,
              }}
            >
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <HiStar
                    key={i}
                    size={16}
                    color={
                      i < Math.floor(product.rating)
                        ? "var(--gold)"
                        : "var(--border2)"
                    }
                  />
                ))}
              </div>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 32 }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: "var(--gold2)",
                }}
              >
                ${currentPrice}
              </span>
              {product.orig && (
                <span
                  style={{
                    fontSize: 20,
                    color: "var(--dim)",
                    textDecoration: "line-through",
                  }}
                >
                  ${product.orig}
                </span>
              )}
              {product.badge && <StatusTag status={product.badge} />}
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: "var(--muted)",
                marginBottom: 32,
              }}
            >
              {product.description}
            </p>

            {/* Color selector */}
            {uniqueColors.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 500, letterSpacing: ".05em", display: "block", marginBottom: 12 }}>
                  Select Color
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: `2px solid ${selectedColor === color ? "var(--gold)" : "var(--border2)"}`,
                        background: selectedColor === color ? "rgba(201,168,76,.1)" : "none",
                        color: selectedColor === color ? "var(--gold2)" : "var(--text)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {uniqueSizes.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, letterSpacing: ".05em" }}>Select Size</label>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {uniqueSizes.map((size) => {
                    // Check if this size + currently selected color exists in variants
                    const matchingVariant = variants.find(v => v.size === size && (uniqueColors.length === 0 || v.color === selectedColor));
                    const isAvailable = matchingVariant && matchingVariant.stock > 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          border: `2px solid ${selectedSize === size ? "var(--gold)" : "var(--border2)"}`,
                          background: selectedSize === size ? "rgba(201,168,76,.1)" : "none",
                          color: selectedSize === size ? "var(--gold2)" : "var(--text)",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all .2s",
                          opacity: isAvailable ? 1 : 0.4,
                          textDecoration: isAvailable ? "none" : "line-through"
                        }}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {isOutOfStock && (
                  <p style={{ color: "var(--rose)", fontSize: 12, marginTop: 8 }}>
                    This specific variant is currently out of stock.
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: ".05em",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Quantity
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: "1px solid var(--border2)",
                    background: "none",
                    color: "var(--text)",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: 16, fontWeight: 500, minWidth: 32, textAlign: "center" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: "1px solid var(--border2)",
                    background: "none",
                    color: "var(--text)",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
              <Btn
                v="primary"
                full
                size="lg"
                onClick={handleAddToCart}
                style={{ flex: 1, opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
                disabled={isOutOfStock}
              >
                <HiShoppingBag size={18} /> {isOutOfStock ? "Out of Stock" : "Add to Bag"}
              </Btn>
              <button
                onClick={() => toggleWishlist(product.id)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  border: `1px solid ${isWished ? "var(--rose)" : "var(--border2)"}`,
                  background: isWished ? "rgba(192,57,43,.1)" : "none",
                  color: isWished ? "var(--rose)" : "var(--text)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .2s",
                }}
              >
                <HiHeart size={22} />
              </button>
            </div>

            {/* Features */}
            <div
              style={{
                padding: 24,
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <HiCheck size={20} color="var(--gold)" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      Free Shipping
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>
                      On orders over $200
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <HiCheck size={20} color="var(--gold)" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      Easy Returns
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>
                      30-day return policy
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <HiCheck size={20} color="var(--gold)" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      Secure Payment
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>
                      Encrypted & safe
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
        <div style={{ marginTop: 40 }}>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Product Details
              </h3>
              <div style={{ fontSize: 13, lineHeight: 2, color: "var(--muted)" }}>
                <p>
                  <strong style={{ color: "var(--text)" }}>Material:</strong>{" "}
                  {product.materials}
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>Care:</strong> {product.care}
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>Made In:</strong> {product.madeIn}
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>SKU:</strong> {product.sku}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;