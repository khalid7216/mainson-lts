// frontend/src/pages/ShopPage.jsx

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard, { QuickView } from "../components/ProductCard";
import { Ticker } from "../components/Layout";
import { NAV_CATEGORIES } from "../data/mockData";
import { productAPI } from "../services/api";
import Pagination from "../components/Pagination";
import SEO from "../components/SEO";

const ShopPage = ({ navigate, addToCart, wishlist, toggleWishlist }) => {
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
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let apiSort = "";
        if (sort === "Price Low") apiSort = "price_asc";
        if (sort === "Price High") apiSort = "price_desc";
        if (sort === "Rating") apiSort = "rating";
        
        const data = await productAPI.getProducts({ 
          page, 
          limit: 12, // Show more products per page in the shop
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
          rating: p.ratings?.length ? p.ratings : 4.5,
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
    <div style={{ paddingTop: 72 }}>
      <SEO pageName="shop" />
      <style>{`
        .shop-layout .shop-sidebar {
          display: none;
        }
        .mobile-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--card);
          border: 1px solid var(--border2);
          border-radius: 6px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
        }
        @media (min-width: 900px) {
          .shop-layout .shop-sidebar {
            display: block !important;
          }
          .mobile-filter-btn {
            display: none !important;
          }
          .shop-container {
            flex-direction: row !important;
          }
        }
        .shop-container {
          flex-direction: column;
        }
        .sidebar-link {
          background: none; 
          border: none; 
          text-align: left; 
          color: var(--muted); 
          cursor: pointer; 
          padding: 6px 0; 
          transition: .2s;
          font-size: 14px;
        }
        .sidebar-link:hover, .sidebar-link.active {
          color: var(--gold);
          transform: translateX(4px);
        }
      `}</style>
      {qv && (
        <QuickView
          product={qv}
          onClose={() => setQv(null)}
          addToCart={addToCart}
        />
      )}
      <Ticker />

      {/* ── Shop Header ─────────────────────────────────────── */}
      <section
        style={{
          padding: "60px clamp(20px, 5vw, 60px) 20px",
          textAlign: "center"
        }}
      >
        <h1
          className="fu"
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 300,
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          {search ? `Results for "${search}"` : "The Collection"}
        </h1>
        <p
          className="fu"
          style={{
            color: "var(--muted)",
            fontSize: 16,
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {search ? "Discover meticulously crafted pieces matching your query." : "Explore our full range of timeless pieces crafted specifically for the discerning woman."}
        </p>
      </section>

      {/* ── Main Shop Layout (Sidebar + Grid) ─────────────────────────────── */}
      <div 
        className="shop-layout"
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "20px clamp(16px, 5vw, 32px) 80px",
          display: "flex",
          gap: 32,
          flexDirection: "column",
        }}
      >
        {/* ── Top Control Bar ── */}
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <p style={{ color: "var(--dim)", fontSize: 13, letterSpacing: ".05em" }}>
            {totalProducts} pieces
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button className="mobile-filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filters
            </button>
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

        <div className="shop-container" style={{ display: "flex", width: "100%", gap: 40 }}>
          
          {/* ── Left Sidebar (Filters) ── */}
          <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`} style={{ width: 250, flexShrink: 0, display: showFilters ? 'block' : undefined }}>
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text)", marginBottom: 16 }}>Categories</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {NAV_CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`sidebar-link ${cat === c ? "active" : ""}`}
                  onClick={() => { changeFilter(c); setShowFilters(false); }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ height: 1, background: "var(--border2)", margin: "32px 0" }} />

            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text)", marginBottom: 16 }}>Price Range</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Under $500</p>
            <input type="range" min="0" max="500" defaultValue="500" style={{ width: "100%", accentColor: "var(--gold)" }} />
          </aside>

          {/* ── Product Grid ── */}
          <div style={{ flex: 1 }}>
            <div
              className="prod-grid-desktop"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))",
                gap: 28,
              }}
            >
              {apiProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  navigate={navigate}
                  addToCart={addToCart}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                  onQuickView={() => setQv(p)}
                  delay={i * 0.03}
                />
              ))}
              {!loading && apiProducts.length === 0 && (
                <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--muted)", padding: "40px 0" }}>
                  No products found. Please try a different category or search term.
                </p>
              )}
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
        </div>
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

export default ShopPage;
