// frontend/src/App.jsx

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { wishlistAPI } from "./services/api";
import GlobalStyles from "./styles/GlobalStyles";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminPanel from "./pages/admin/AdminPanel";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import DynamicPage from "./pages/DynamicPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import { LoginPage, SignupPage, ForgotPage } from "./pages/AuthPages";
import ChatWidget from "./components/ChatWidget";

/* ── Stripe setup ──────────────────────────────── */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

/* ── App Content (inside Router) ────────────────── */
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist when user connects
  useEffect(() => {
    if (user) {
      wishlistAPI.getWishlist()
        .then(res => {
          // res.wishlist is array of { _id, user, product: { _id, ... } }
          setWishlist(res.wishlist.map(w => w.product._id || w.product.id || w.product));
        })
        .catch(err => console.error("Wishlist error:", err));
    } else {
      setWishlist([]);
    }
  }, [user]);

  /* Cart helpers */
  const addToCart = (product) =>
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      return existing
        ? prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...product, qty: 1 }];
    });

  const toggleWishlist = async (id) => {
    if (!user) {
      toast("Please login to save to wishlist", "err");
      navigate("/login");
      return;
    }

    // Optimistic UI update
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

    try {
      await wishlistAPI.toggleWishlist(id);
    } catch (err) {
      console.error(err);
      toast("Failed to update wishlist", "err");
      // Revert on error
      setWishlist((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  /* Loading state while checking auth */
  if (authLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--void)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              border: "3px solid var(--border)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <ChatWidget />

      <Routes>
        {/* Auth routes (full-screen, no navbar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Main routes (with navbar) */}
        <Route
          path="/*"
          element={
            <>
              {/* Hide public Navbar on admin panel */}
              {!location.pathname.startsWith("/admin") && (
                <Navbar navigate={navigate} cartCount={cartCount} />
              )}
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      navigate={navigate}
                      addToCart={addToCart}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                    />
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ShopPage
                      navigate={navigate}
                      addToCart={addToCart}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                    />
                  }
                />
                <Route
                  path="/track-order"
                  element={<TrackOrderPage />}
                />
                <Route
                  path="/cart"
                  element={
                    <CartPage
                      cart={cart}
                      setCart={setCart}
                      navigate={navigate}
                    />
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    user ? (
                      <CheckoutPage
                        cart={cart}
                        setCart={setCart}
                        navigate={navigate}
                      />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
                <Route
                  path="/product/:slug"
                  element={
                    <ProductDetailPage
                      navigate={navigate}
                      addToCart={addToCart}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                    />
                  }
                />
                <Route
                  path="/page/:slug"
                  element={
                    <DynamicPage />
                  }
                />
                <Route
                  path="/profile"
                  element={
                    user ? (
                      <ProfilePage 
                        navigate={navigate} 
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                        addToCart={addToCart}
                      />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    user ? (
                      <SettingsPage navigate={navigate} />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                {/* ✅ FIXED: /admin now redirects to /login instead of / */}
                <Route
                  path="/admin"
                  element={
                    user?.isAdmin ? (
                      <AdminPanel navigate={navigate} />
                    ) : !user ? (
                      <Navigate to="/login" replace />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />

              </Routes>
            </>
          }
        />
      </Routes>
    </>
  );
};

/* ── Root App Component ─────────────────────────── */
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Elements stripe={stripePromise}>
            <AppContent />
          </Elements>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;