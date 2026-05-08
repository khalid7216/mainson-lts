require("dotenv").config();
const express      = require("express");
const helmet       = require("helmet");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const path         = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB    = require("./config/db");
const authRoutes         = require("./routes/authRoutes");
const userRoutes         = require("./routes/userRoutes");
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
const notificationRoutes   = require("./routes/notificationRoutes");
const activityLogRoutes    = require("./routes/activityLogRoutes");
const mediaRoutes          = require("./routes/mediaRoutes");
const bannerRoutes         = require("./routes/bannerRoutes");
const pageRoutes           = require("./routes/pageRoutes");
const seoRoutes            = require("./routes/seoRoutes");
const couponRoutes         = require("./routes/couponRoutes");
const chatbotRoutes        = require("./routes/chatbotRoutes");
const app  = express();
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
const PORT = process.env.PORT || 5000;

/* ── Connect DB ─────────────────────────────────── */
connectDB();

/* — CORS */
app.use(cors({
  origin: function(origin, callback) {
    const allowed = process.env.CLIENT_URL.split(',');
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
/* ── Stripe webhook needs raw body (before JSON parser) ── */
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

/* ── API Routes ─────────────────────────────────── */
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
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
app.use("/api/activity-logs",  activityLogRoutes);
app.use("/api/media",          mediaRoutes);
app.use("/api/banners",        bannerRoutes);
app.use("/api/pages",          pageRoutes);
app.use("/api/seo",            seoRoutes);
app.use("/api/coupons",        couponRoutes);
app.use("/api/chatbot",        chatbotRoutes);
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
