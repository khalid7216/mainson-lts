require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const path         = require("path");
const connectDB    = require("./config/db");
const authRoutes   = require("./routes/authRoutes");

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Connect DB ─────────────────────────────────── */
connectDB();

/* ── CORS ───────────────────────────────────────── */
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow all maison-lite vercel deployments + localhost
    if (
      origin.includes("mainson-frontend") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Preflight requests handle karo
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

/* ── API Routes ─────────────────────────────────── */
app.use("/api/auth", authRoutes);

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