// frontend/src/App.jsx

import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import GlobalStyles from "./styles/GlobalStyles";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminPanel from "./pages/admin/AdminPanel";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { LoginPage, SignupPage, ForgotPage } from "./pages/AuthPages";

/* ── Stripe setup ──────────────────────────────── */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

/* ── App Content (inside Router) ────────────────── */
const AppContent = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  /* Cart helpers */
  const addToCart = (product) =>
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      return existing
        ? prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...product, qty: 1 }];
    });

  const toggleWishlist = (id) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

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
              <Navbar navigate={navigate} cartCount={cartCount} />
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
                  path="/profile"
                  element={
                    user ? (
                      <ProfilePage navigate={navigate} />
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