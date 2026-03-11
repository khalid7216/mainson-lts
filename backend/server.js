require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const path         = require("path");
const connectDB    = require("./config/db");
const authRoutes         = require("./routes/authRoutes");
const productRoutes      = require("./routes/productRoutes");
const categoryRoutes     = require("./routes/categoryRoutes");
const cartRoutes         = require("./routes/cartRoutes");
const wishlistRoutes     = require("./routes/wishlistRoutes");
const orderRoutes        = require("./routes/orderRoutes");
const paymentRoutes      = require("./routes/paymentRoutes");
const addressRoutes      = require("./routes/addressRoutes");
const ratingRoutes       = require("./routes/ratingRoutes");
const settingsRoutes     = require("./routes/settingsRoutes");
const shippingRoutes     = require("./routes/shippingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Connect DB ─────────────────────────────────── */
connectDB();

/* ── CORS (manual – works on Vercel serverless) ── */
const allowedOrigins = [
  "https://mainson-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes("mainson-frontend"))) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Respond to preflight immediately
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

/* ── Stripe webhook needs raw body (before JSON parser) ── */
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());

/* ── API Routes ─────────────────────────────────── */
app.use("/api/auth",          authRoutes);
app.use("/api/products",      productRoutes);
app.use("/api/categories",    categoryRoutes);
app.use("/api/cart",           cartRoutes);
app.use("/api/wishlist",       wishlistRoutes);
app.use("/api/orders",         orderRoutes);
app.use("/api/payments",       paymentRoutes);
app.use("/api/addresses",      addressRoutes);
app.use("/api/ratings",        ratingRoutes);
app.use("/api/settings",       settingsRoutes);
app.use("/api/shipping",       shippingRoutes);
app.use("/api/notifications",  notificationRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

/* ── API 404 handler ────────────────────────────── */
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

/* ── HTML routes ────────────────────────────────── */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "404.html"));
});

/* ── Global error handler ───────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});
// add local host 
app.listen(PORT, () => console.log(`✦ Server running on port http://localhost:${PORT}`));