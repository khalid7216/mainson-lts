// frontend/src/components/Navbar.jsx
// ═════════════════════════════════════════════════════════════
//  FIXED: Using navigate instead of setPage
// ═════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";
import { IoHomeOutline, IoBagOutline, IoPersonOutline, IoSettingsOutline, IoFlashOutline, IoLogOutOutline } from "react-icons/io5";

const Navbar = ({ navigate, cartCount = 0 }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 72,
        background: scrolled ? "rgba(5,4,4,.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all .3s",
      }}
    >
      {/* Desktop Navigation */}
      <div
        className="desktop-only"
        style={{
          height: "100%",
        }}
      >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 32px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 300,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--text)",
              margin: 0,
            }}
          >
            Maison·Élite
          </h1>
        </button>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 13,
              letterSpacing: ".08em",
              position: "relative",
              transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
          >
            <IoBagOutline size={16} /> Cart
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -10,
                  background: "var(--gold)",
                  color: "#0a0908",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdown(!dropdown)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Avatar name={user.name} size={32} />
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text)",
                    letterSpacing: ".05em",
                  }}
                >
                  {user.name?.split(" ")[0]}
                </span>
              </button>

              {dropdown && (
                <>
                  <div
                    onClick={() => setDropdown(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 99,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: 0,
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: 8,
                      minWidth: 180,
                      zIndex: 100,
                      boxShadow: "0 12px 40px rgba(0,0,0,.6)",
                    }}
                  >
                    <button
                      onClick={() => {
                        setDropdown(false);
                        navigate("/profile");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        color: "var(--text)",
                        fontSize: 13,
                        cursor: "pointer",
                        borderRadius: 6,
                        transition: "background .2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "var(--lift)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "none")
                      }
                    >
                      <IoPersonOutline size={16} style={{ marginRight: 8 }} /> Profile
                    </button>

                    <button
                      onClick={() => {
                        setDropdown(false);
                        navigate("/settings");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        color: "var(--text)",
                        fontSize: 13,
                        cursor: "pointer",
                        borderRadius: 6,
                        transition: "background .2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "var(--lift)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "none")
                      }
                    >
                      <IoSettingsOutline size={16} style={{ marginRight: 8 }} /> Settings
                    </button>

                    {user.isAdmin && (
                      <button
                        onClick={() => {
                          setDropdown(false);
                          navigate("/admin");
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          color: "var(--gold2)",
                          fontSize: 13,
                          cursor: "pointer",
                          borderRadius: 6,
                          transition: "background .2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "var(--lift)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "none")
                        }
                      >
                        <IoFlashOutline size={16} style={{ marginRight: 8 }} /> Admin Panel
                      </button>
                    )}

                    <div
                      style={{
                        height: 1,
                        background: "var(--border)",
                        margin: "8px 0",
                      }}
                    />

                    <button
                      onClick={() => {
                        setDropdown(false);
                        logout();
                        navigate("/");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        color: "var(--rose)",
                        fontSize: 13,
                        cursor: "pointer",
                        borderRadius: 6,
                        transition: "background .2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "rgba(192,57,43,.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "none")
                      }
                    >
                      <IoLogOutOutline size={16} style={{ marginRight: 8 }} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "10px 24px",
                background: "var(--gold)",
                border: "none",
                borderRadius: 6,
                color: "#0a0908",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--gold2)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--gold)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      </div>

      {/* Mobile Top Logo (Centered) */}
      <div className="mobile-only" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", padding: 0 }}
        >
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 300, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text)", margin: 0 }}>
            Maison·Élite
          </h1>
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-only mobile-bottom-nav">
        <button 
          className={`mobile-nav-item ${location.pathname === "/" ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          <IoHomeOutline size={22} />
          <span>Home</span>
        </button>
        
        <button 
          className={`mobile-nav-item ${location.pathname === "/cart" || location.pathname === "/checkout" ? "active" : ""}`}
          onClick={() => navigate("/cart")}
          style={{ position: "relative" }}
        >
          <IoBagOutline size={22} />
          <span>Cart</span>
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: 4, right: 18, background: "var(--gold)", color: "#0a0908", width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600 }}>
              {cartCount}
            </span>
          )}
        </button>

        <button 
          className={`mobile-nav-item ${location.pathname === "/profile" ? "active" : ""}`}
          onClick={() => navigate(user ? "/profile" : "/login")}
        >
          <IoPersonOutline size={22} />
          <span>Profile</span>
        </button>

        {user ? (
          <button 
            className={`mobile-nav-item ${location.pathname === "/settings" ? "active" : ""}`}
            onClick={() => navigate("/settings")}
          >
            <IoSettingsOutline size={22} />
            <span>Settings</span>
          </button>
        ) : (
          <button 
            className={`mobile-nav-item ${location.pathname === "/login" ? "active" : ""}`}
            onClick={() => navigate("/login")}
          >
            <IoLogOutOutline size={22} style={{ transform: "rotate(180deg)" }}/>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;