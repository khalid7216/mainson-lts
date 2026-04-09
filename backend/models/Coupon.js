// backend/models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type:     String,
      required: [true, "Coupon code is required"],
      unique:   true,
      trim:     true,
      uppercase: true,
    },
    type: {
      type:    String,
      enum:    ["percentage", "fixed", "giftcard"],
      required: true,
      default: "percentage",
    },
    discountValue: {
      type:     Number,
      required: [true, "Discount value is required"],
      min:      [0, "Value cannot be negative"],
    },
    balance: {
      type: Number, // For gift cards
      default: 0,
    },
    minOrderValue: {
      type:    Number,
      default: 0,
    },
    maxDiscount: {
      type:    Number, // Max discount amount for percentage coupons
      default: null,
    },
    usageLimit: {
      type:    Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type:    Number,
      default: 0,
    },
    expiryDate: {
      type:     Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ── Middleware to check if expired ────────────── */
couponSchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

/* ── Middleware to check if usage limit reached ── */
couponSchema.methods.isLimitReached = function () {
  if (this.usageLimit === null) return false;
  return this.usedCount >= this.usageLimit;
};

module.exports = mongoose.model("Coupon", couponSchema);
