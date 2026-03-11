// backend/middleware/auth.js
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/* ── protect: verify JWT & attach user to req ───── */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Accept token from Authorization header OR cookie
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated — please sign in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/* ── adminOnly: must be role === "admin" ─────────── */
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};
