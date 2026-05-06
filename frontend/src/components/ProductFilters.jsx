import { useState, useEffect } from "react";

const ProductFilters = ({ categories, filters, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Debounce search 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

  const handleClear = () => {
    setSearchInput("");
    onFilterChange({
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      search: ""
    }, true); // The boolean flag tells the parent to overwrite entirely
  };

  return (
    <aside className="shop-sidebar" style={{ width: 250, flexShrink: 0 }}>
      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text)", marginBottom: 12 }}>Search</h3>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 6, background: "var(--card)", border: "1px solid var(--border2)", color: "var(--text)" }}
        />
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text)", marginBottom: 16 }}>Categories</h3>
        <select 
          value={filters.category} 
          onChange={(e) => onFilterChange({ category: e.target.value })}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 6, background: "var(--card)", border: "1px solid var(--border2)", color: "var(--text)", cursor: "pointer" }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id || c.name || c} value={c._id || c.name || c}>{c.name || c}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text)", marginBottom: 16 }}>Price Range</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            style={{ width: "50%", padding: "10px 14px", borderRadius: 6, background: "var(--card)", border: "1px solid var(--border2)", color: "var(--text)" }}
          />
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            style={{ width: "50%", padding: "10px 14px", borderRadius: 6, background: "var(--card)", border: "1px solid var(--border2)", color: "var(--text)" }}
          />
        </div>
      </div>

      {/* Clear Filters */}
      <button 
        onClick={handleClear}
        style={{ 
          width: "100%", 
          padding: "12px", 
          borderRadius: 6, 
          background: "transparent", 
          border: "1px solid var(--border2)", 
          color: "var(--text)", 
          cursor: "pointer", 
          transition: "0.2s" 
        }}
      >
        Clear Filters
      </button>
    </aside>
  );
};

export default ProductFilters;