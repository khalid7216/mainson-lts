// backend/models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: true,
      unique:   true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    stripePaymentIntentId: {
      type:   String,
      unique: true,
      sparse: true,
    },
    amount: {
      type:     Number,
      required: true,
      min:      0,
    },
    currency: {
      type:    String,
      default: "usd",
      lowercase: true,
    },
    status: {
      type:    String,
      enum:    ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    method: {
      type:    String,
      default: "card",
    },
    refundId: {
      type:    String,
      default: null,
    },
    refundReason: {
      type:    String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
