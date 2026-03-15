// frontend/src/pages/ProductDetailPage.jsx
// ═════════════════════════════════════════════════════════════
//  UPDATED: Changed from id to slug
// ═════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Btn, StatusTag } from "../components/UI";
import { PRODUCTS } from "../data/mockData";
import { HiStar, HiHeart, HiShoppingBag, HiCheck } from "react-icons/hi";
import { IoArrowBack } from "react-icons/io5";

const ProductDetailPage = ({ navigate, addToCart, wishlist, toggleWishlist }) => {
  const { slug } = useParams();  // ✅ CHANGED: id → slug
  const toast = useToast();
  
  const product = PRODUCTS.find((p) => p.slug === slug);  // ✅ CHANGED: p.id === parseInt(id) → p.slug === slug
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);  // ✅ CHANGED: id → slug

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
  const sizes = ["XS", "S", "M", "L", "XL"];
  
  // Mock images (use same image multiple times for demo)
  const images = [product.image, product.image, product.image];

  /* ── SEO: Inject JSON-LD structured data ──────── */
  useEffect(() => {
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
        price: product.price.toFixed(2),
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

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast("Please select a size", "err");
      return;
    }
    addToCart(product);
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
            <p
              style={{
                fontSize: 11,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 16,
              }}
            >
              {product.cat}
            </p>

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
                ${product.price}
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
              Crafted from the finest materials, this piece embodies timeless
              elegance. The sophisticated design features clean lines and
              impeccable tailoring, making it a versatile addition to your
              wardrobe. Perfect for both casual and formal occasions.
            </p>

            {/* Size selector */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: ".05em",
                  }}
                >
                  Select Size
                </label>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold)",
                    fontSize: 11,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Size Guide
                </button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      border: `2px solid ${
                        selectedSize === size ? "var(--gold)" : "var(--border2)"
                      }`,
                      background:
                        selectedSize === size ? "rgba(201,168,76,.1)" : "none",
                      color: selectedSize === size ? "var(--gold2)" : "var(--text)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

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
                style={{ flex: 1 }}
              >
                <HiShoppingBag size={18} /> Add to Bag
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
                  100% Premium Cotton
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>Care:</strong> Machine
                  wash cold, tumble dry low
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>Made In:</strong> Italy
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>SKU:</strong> ME-
                  {product.id}-001
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