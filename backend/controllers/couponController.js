// backend/controllers/couponController.js
const Coupon = require("../models/Coupon");

/**
 * @desc    Validate a coupon code
 * @route   POST /api/coupons/validate
 * @access  Public (Authenticated check is usually better but fine for now)
 */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Please enter a coupon code" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
    }

    // Check expiry
    if (coupon.isExpired()) {
      return res.status(400).json({ success: false, message: "Coupon code has expired" });
    }

    // Check usage limit
    if (coupon.isLimitReached()) {
      return res.status(400).json({ success: false, message: "Coupon usage limit has been reached" });
    }

    // Check min order value
    if (cartTotal && cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value of $${coupon.minOrderValue} required for this coupon` 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        success: true, // Frontend expects res.data.success
        code: coupon.code,
        type: coupon.type,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderValue: coupon.minOrderValue
      }
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");
    res.status(200).json({
      success: true,
      data: {
        coupons // Frontend expects res.data.coupons
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new coupon (Admin)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
exports.createCoupon = async (req, res) => {
  try {
    const { code, ...rest } = req.body;
    
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      ...rest
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle coupon status (Admin)
 * @route   PATCH /api/coupons/:id/toggle
 * @access  Private/Admin
 */
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({ success: true, isActive: coupon.isActive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
