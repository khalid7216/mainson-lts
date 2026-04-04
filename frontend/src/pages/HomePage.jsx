// frontend/src/pages/HomePage.jsx
// ═════════════════════════════════════════════════════════════
//  FIXED: Pass navigate to ProductCard
// ═════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard, { QuickView } from "../components/ProductCard";
import { Ticker } from "../components/Layout";
import { Btn } from "../components/UI";
import { NAV_CATEGORIES } from "../data/mockData";
import { productAPI } from "../services/api";
import Pagination from "../components/Pagination";
import { IoSparklesOutline, IoLogoInstagram, IoLogoTwitter, IoLogoPinterest } from "react-icons/io5";
import SEO from "../components/SEO";

const HomePage = ({ navigate, addToCart, wishlist, toggleWishlist }) => {
  const [qv, setQv] = useState(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let apiSort = "";
        
        // Fetch only top 4 newest/featured products for the homepage
        const data = await productAPI.getProducts({ 
          page: 1, 
          limit: 4 
        });
        const formattedProducts = data.products.map((p) => ({
          id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          orig: p.compareAtPrice,
          cat: p.category?.name || "Uncategorized",
          badge: p.badge,
          rating: p.ratings?.length ? p.ratings : 4.5, // Dummy default if not available
          reviews: 0,
          image: p.images?.[0] || p.image?.url || p.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
        }));
        setApiProducts(formattedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const products = apiProducts;

  return (
    <div>
      <SEO pageName="home" />
      {qv && (
        <QuickView
          product={qv}
          onClose={() => setQv(null)}
          addToCart={addToCart}
        />
      )}
      <Ticker />

      {/* ── Hero ─────────────────────────────────────── */}
      <section
        style={{
          height: "92vh",
          minHeight: 600,
          background: "var(--void)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background orbs + grid */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,168,76,.12) 0%, transparent 70%)",
              top: "-15%",
              right: "-5%",
              animation: "pulse 8s ease infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(107,45,78,.15) 0%, transparent 70%)",
              bottom: "-10%",
              left: "5%",
              animation: "pulse 6s ease infinite 2s",
            }}
          />
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.04,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={`${(i + 1) * 8.33}%`}
                y1="0"
                x2={`${(i + 1) * 8.33}%`}
                y2="100%"
                stroke="var(--gold)"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={`${(i + 1) * 12.5}%`}
                x2="100%"
                y2={`${(i + 1) * 12.5}%`}
                stroke="var(--gold)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {/* Hero text */}
        <div
          className="hero-text-wrap"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 clamp(20px, 6vw, 60px)",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          <p
            className="fu"
            style={{
              fontSize: 10,
              letterSpacing: ".5em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 28,
              animationDelay: ".1s",
            }}
          >
            <IoSparklesOutline style={{ marginRight: 4, verticalAlign: "middle" }} size={12} /> Spring / Summer 2026 <IoSparklesOutline style={{ marginLeft: 4, verticalAlign: "middle" }} size={12} />
          </p>
          <h1
            className="fu hero-title"
            style={{
              fontSize: "clamp(56px, 8.5vw, 130px)",
              fontWeight: 300,
              lineHeight: 0.88,
              marginBottom: 40,
              animationDelay: ".2s",
            }}
          >
            Dressed in
            <br />
            <span className="gold-text" style={{ fontStyle: "italic" }}>
              Silence.
            </span>
          </h1>
          <p
            className="fu"
            style={{
              color: "var(--muted)",
              fontSize: 16,
              maxWidth: 460,
              lineHeight: 1.85,
              marginBottom: 50,
              animationDelay: ".35s",
            }}
          >
            Curated pieces for the woman who speaks through what she wears.
            Timeless. Purposeful. Exclusively hers.
          </p>
          <div
            className="fu"
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              animationDelay: ".5s",
            }}
          >
            <Btn v="primary" size="lg">
              Explore SS26
            </Btn>
            <Btn v="ghost" size="lg">
              View Lookbook →
            </Btn>
          </div>
        </div>

        {/* Floating stats */}
        <div
          className="fu glass hide-mobile"
          style={{
            position: "absolute",
            right: "6%",
            bottom: "22%",
            padding: "22px 28px",
            borderRadius: 10,
            animationDelay: ".7s",
          }}
        >
          <p
            style={{
              fontSize: 38,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              color: "var(--gold)",
            }}
          >
            280+
          </p>
          <p
            style={{
              fontSize: 10,
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            New Arrivals
          </p>
        </div>
        <div
          className="fu glass hide-mobile"
          style={{
            position: "absolute",
            right: "6%",
            top: "26%",
            padding: "18px 24px",
            borderRadius: 10,
            animationDelay: ".9s",
          }}
        >
          <p style={{ fontSize: 28, fontFamily: "'Playfair Display', serif" }}>
            1,842
          </p>
          <p
            style={{
              fontSize: 10,
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            Happy Clients
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            color: "var(--dim)",
            fontSize: 10,
            letterSpacing: ".2em",
          }}
        >
          <span>SCROLL</span>
          <div
            style={{
              width: 1,
              height: 40,
              background: "linear-gradient(180deg, var(--dim) 0%, transparent 100%)",
            }}
          />
        </div>
      </section>

      {/* ── Featured Section Title ───────────────────── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "64px clamp(20px, 5vw, 32px) 20px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, textAlign: "center" }}>
          Trending Latest Arrivals
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 12, letterSpacing: ".05em" }}>
          A curated selection of our most loved pieces.
        </p>
      </div>

      {/* ── Product Grid ─────────────────────────────── */}
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "24px clamp(16px, 5vw, 32px) 80px",
        }}
      >
        <div
          className="prod-grid-mobile"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))",
            gap: 28,
          }}
        >
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              navigate={navigate} // ✅ ADDED: Pass navigate
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              onQuickView={() => setQv(p)}
              delay={i * 0.05}
            />
          ))}
        </div>
        
        {/* Explore All Button */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>Loading...</div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
            <Btn v="secondary" size="lg" onClick={() => navigate("/shop")}>
              Explore Full Collection →
            </Btn>
          </div>
        )}
      </div>

      {/* ── Editorial Banner ─────────────────────────── */}
      <div
        style={{
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "80px clamp(24px, 8vw, 60px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,.1) 0%, transparent 60%)",
          }}
        />
        <p
          style={{
            fontSize: 10,
            letterSpacing: ".4em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 20,
            position: "relative",
          }}
        >
          The Maison Promise
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 300,
            fontSize: "clamp(28px, 4vw, 52px)",
            marginBottom: 16,
            position: "relative",
          }}
        >
          Crafted Without Compromise
        </h2>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 14,
            marginBottom: 40,
            position: "relative",
          }}
        >
          Complimentary returns · Ethical sourcing · Lifetime care
        </p>
        <Btn v="primary" size="lg">
          Our Story
        </Btn>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <footer
        className="app-footer"
        style={{
          background: "var(--void)",
          borderTop: "1px solid var(--border)",
          padding: "64px clamp(24px, 8vw, 60px) 32px",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 48,
              marginBottom: 56,
            }}
            className="grid-2-col"
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                MAISON<span className="gold-text">·ÉLITE</span>
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 13,
                  lineHeight: 1.85,
                  maxWidth: 260,
                  marginBottom: 24,
                }}
              >
                A curated fashion house for the discerning woman. Where luxury
                meets purpose.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                {[<IoLogoInstagram size={16} />, <IoLogoTwitter size={16} />, <IoLogoPinterest size={16} />].map((icon, i) => (
                  <button
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1px solid var(--border2)",
                      background: "none",
                      color: "var(--dim)",
                      cursor: "pointer",
                      fontSize: 14,
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "var(--gold)";
                      e.target.style.color = "var(--gold)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "var(--border2)";
                      e.target.style.color = "var(--dim)";
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {[
              {
                t: "Shop",
                l: [
                  "New Arrivals",
                  "Dresses",
                  "Outerwear",
                  "Accessories",
                  "Sale",
                ],
              },
              {
                t: "Help",
                l: [
                  "Sizing Guide",
                  "Returns",
                  "Shipping",
                  "Gift Cards",
                  "Contact",
                ],
              },
              {
                t: "Maison",
                l: [
                  "Our Story",
                  "Sustainability",
                  "Press",
                  "Careers",
                  "Stockists",
                ],
              },
            ].map((col) => (
              <div key={col.t}>
                <p
                  style={{
                    fontSize: 10,
                    letterSpacing: ".25em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: 18,
                  }}
                >
                  {col.t}
                </p>
                {col.l.map((l) => (
                  <p
                    key={l}
                    style={{
                      color: "var(--muted)",
                      fontSize: 13,
                      marginBottom: 11,
                      cursor: "pointer",
                      transition: "color .2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--muted)")
                    }
                  >
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--dim)",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span>© 2026 Maison Élite. All rights reserved.</span>
            <span>Privacy · Terms · Accessibility</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;