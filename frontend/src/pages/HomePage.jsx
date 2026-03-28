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

const HomePage = ({ navigate, addToCart, wishlist, toggleWishlist }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cat = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "Featured";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [qv, setQv] = useState(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let apiSort = "";
        if (sort === "Price Low") apiSort = "price_asc";
        if (sort === "Price High") apiSort = "price_desc";
        if (sort === "Rating") apiSort = "rating";
        
        // Pass page and limit to the generic products route
        const data = await productAPI.getProducts({ 
          page, 
          limit: 8, 
          sort: apiSort,
          search
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
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, sort, cat, search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, cat]);

  const products = apiProducts;

  const changeFilter = (c) => {
    setSearchParams({ category: c, sort, page: 1, search });
  };

  const changeSort = (s) => {
    setSearchParams({ category: cat, sort: s, page: 1, search });
  };

  const changePage = (p) => {
    setSearchParams({ category: cat, sort, page: p, search });
  };

  return (
    <div>
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
            ✦ Spring / Summer 2026 ✦
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

      {/* ── Filters ──────────────────────────────────── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "48px clamp(20px, 5vw, 32px) 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, width: "100%", WebkitOverflowScrolling: "touch" }}>
            {NAV_CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip${cat === c ? " active" : ""}`}
                onClick={() => changeFilter(c)}
                style={{ flexShrink: 0 }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <select
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: 6,
              border: "1px solid var(--border2)",
              background: "var(--card)",
              color: "var(--text)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {["Featured", "Price Low", "Price High", "Rating"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "var(--dim)",
            marginTop: 12,
            letterSpacing: ".05em",
          }}
        >
          {totalProducts} pieces
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
        
        {/* Pagination Integration */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>Loading...</div>
        ) : (
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={changePage} 
          />
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
                {["◈", "◉", "◆"].map((s, i) => (
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
                    {s}
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