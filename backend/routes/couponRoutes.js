// backend/routes/couponRoutes.js
const express = require("express");
const router  = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon
} = require("../controllers/couponController");
const { protect, adminOnly } = require("../middleware/auth");

/**
 * Public Routes
 */
router.post("/validate", validateCoupon);

/**
 * Admin Routes
 */
router.use(protect);
router.use(adminOnly);

router.get("/", getAllCoupons);
router.post("/", createCoupon);
router.patch("/:id/toggle", toggleCouponStatus);
router.delete("/:id", deleteCoupon);

module.exports = router;
