import React, { useState, useEffect } from "react";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";

const SearchBar = ({ initialQuery = "", onSearch, isLoading }) => {
  const [query, setQuery] = useState(initialQuery);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--card)",
          border: "1px solid var(--border2)",
          borderRadius: "8px",
          padding: "8px 16px",
          transition: "border-color 0.2s ease",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
      >
        <IoSearchOutline 
          size={18} 
          style={{ color: "var(--dim)", marginRight: "8px" }} 
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "var(--text)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              color: "var(--dim)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
            title="Clear search"
          >
            <IoCloseOutline size={18} />
          </button>
        )}
      </div>
      {isLoading && (
        <div 
          style={{ 
            position: "absolute", 
            right: "12px", 
            top: "50%", 
            transform: "translateY(-50%)",
            fontSize: "12px",
            color: "var(--gold)",
            animation: "pulse 1.5s infinite"
          }}
        >
          ...
        </div>
      )}
    </div>
  );
};

export default SearchBar;
