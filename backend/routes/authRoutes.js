// backend/routes/authRoutes.js
// ═════════════════════════════════════════════════════════════
//  UPDATED: Added new routes for profile/password updates
// ═════════════════════════════════════════════════════════════

const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts. Try after 15 minutes." }
});

router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// ✅ NEW ROUTES
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;