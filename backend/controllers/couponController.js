const Coupon = require("../models/Coupon");
const Product = require("../models/Product");

// Validates coupon against product/cart securely without exposing logic
exports.validateCoupon = async (req, res) => {
  try {
    const { code, productId, productType } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Code required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Inactive code" });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit && coupon.type !== "giftcard") {
      return res.status(400).json({ success: false, message: "Usage limit reached" });
    }
    
    if (coupon.type === "giftcard" && coupon.balance <= 0) {
      return res.status(400).json({ success: false, message: "Empty gift card" });
    }

    let finalDiscountValue = coupon.type === "giftcard" ? coupon.balance : coupon.discountValue;

    return res.status(200).json({
      success: true,
      message: "Code applied successfully",
      type: coupon.type,
      discountValue: finalDiscountValue,
      maxDiscount: coupon.maxDiscount,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// === Admin only handlers ===

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({ success: false, coupons: [] });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountValue, expiryDate, type } = req.body;

    // 1. Basic Validation
    if (!code || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: code, discountValue, and expiryDate.",
        data: null,
      });
    }

    // 2. Validate Expiry Date (Cannot be in the past)
    const expiry = new Date(expiryDate);
    if (expiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date cannot be in the past.",
        data: null,
      });
    }

    // Convert code to uppercase as per schema
    req.body.code = code.toUpperCase().trim();

    // 3. Create Coupon (MongoDB will handle the actual creation)
    const newCoupon = await Coupon.create(req.body);

    // 4. Send Success Response
    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: newCoupon,
      coupon: newCoupon, // Keeping for backward compatibility with frontend
    });

  } catch (error) {
    console.error("Error creating coupon:", error); // Logging for debugging

    // Handle Mongoose Duplicate Key Error (Code already exists)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A coupon with this code already exists.",
        data: null,
      });
    }

    // Handle Mongoose Validation Errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
        data: null,
      });
    }

    // Default to 500 Server Error
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while creating the coupon.",
      data: null,
    });
  }
};

exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
