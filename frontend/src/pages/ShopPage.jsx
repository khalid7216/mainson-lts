import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import SEO from "../components/SEO";
import { getProducts, getCategories } from "../services/productService";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    search: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories || data.data || data); 
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products internally caching
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProducts({
        ...filters,
        page: currentPage,
        limit: 12,
      });
      setProducts(data.products || data.data || []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadProducts]);

  const handleFilterChange = (newFilterVals, isReset = false) => {
    setCurrentPage(1);
    if (isReset) {
      setFilters(newFilterVals);
    } else {
      setFilters(prev => ({ ...prev, ...newFilterVals }));
    }
  };

  const handleSortChange = (e) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, sort: e.target.value }));
  };

  return (
    <div style={{ paddingTop: 72 }}>
      <SEO pageName="shop" />
      <style>{"\n        .mobile-filter-btn {\n          display: flex;\n          align-items: center;\n          gap: 6px;\n          padding: 8px 16px;\n          background: var(--card);\n          border: 1px solid var(--border2);\n          border-radius: 6px;\n          color: var(--text);\n          font-size: 14px;\n          cursor: pointer;\n        }\n        @media (min-width: 900px) {\n          .mobile-filter-btn {\n            display: none !important;\n          }\n          .shop-container {\n            flex-direction: row !important;\n          }\n          .mobile-filters-wrap {\n            display: block !important;\n          }\n        }\n        .shop-container {\n          flex-direction: column;\n        }\n        .mobile-filters-wrap {\n          display: none;\n        }\n        .mobile-filters-wrap.show {\n          display: block;\n        }\n        .skeleton-card {\n          height: 480px;\n          background: var(--lift);\n          border-radius: 12px;\n          animation: pulse 1.5s infinite;\n        }\n        @keyframes pulse {\n          0% { opacity: 0.6; }\n          50% { opacity: 0.3; }\n          100% { opacity: 0.6; }\n        }\n      "}</style>
      <section style={{ padding: "60px clamp(20px, 5vw, 60px) 20px", textAlign: "center" }}>
        <h1 className="fu" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 300, lineHeight: 1, marginBottom: 16 }}>
          {filters.search ? "Results for \"" + filters.search + "\"" : "The Collection"}
        </h1>
        <p className="fu" style={{ color: "var(--muted)", fontSize: 16, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          {filters.search ? "Discover meticulously crafted pieces matching your query." : "Explore our full range of timeless pieces crafted specifically for the discerning woman."}
        </p>
      </section>
      <div className="shop-layout" style={{ maxWidth: 1320, margin: "0 auto", padding: "20px clamp(16px, 5vw, 32px) 80px", display: "flex", gap: 32, flexDirection: "column" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <p style={{ color: "var(--dim)", fontSize: 13, letterSpacing: ".05em" }}>
            Showing page {currentPage} of {totalPages}
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button className="mobile-filter-btn" onClick={() => setShowMobileFilters(!showMobileFilters)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filters
            </button>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              style={{ padding: "9px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "var(--card)", color: "var(--text)", fontSize: 12, cursor: "pointer" }}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        <div className="shop-container" style={{ display: "flex", width: "100%", gap: 40 }}>
          <div className={"mobile-filters-wrap " + (showMobileFilters ? "show" : "")}>
            <ProductFilters 
              categories={categories} 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>

          <div style={{ flex: 1 }}>
            {isLoading ? (
              <div className="prod-grid-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))", gap: 28 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ color: "var(--rose)", marginBottom: 16 }}>{error}</p>
                <button 
                  onClick={loadProducts} 
                  style={{ padding: "10px 24px", background: "var(--text)", color: "var(--void)", border: "none", borderRadius: 6, cursor: "pointer" }}
                >
                  Try again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
                <p>No products found matching your filters.</p>
              </div>
            ) : (
              <>
                <div className="prod-grid-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))", gap: 28 }}>
                  {products.map((p, i) => (
                    <ProductCard key={p._id} product={p} delay={i * 0.03} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 40 }}>
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border2)", background: "transparent", color: currentPage === 1 ? "var(--dim)" : "var(--text)", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                    >
                      Prev
                    </button>
                    <span style={{ fontSize: 14 }}>{currentPage} / {totalPages}</span>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border2)", background: "transparent", color: currentPage === totalPages ? "var(--dim)" : "var(--text)", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
