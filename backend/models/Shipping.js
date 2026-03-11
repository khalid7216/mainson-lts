// backend/models/Shipping.js
const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema(
  {
    order: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: true,
      unique:   true,
    },
    carrier: {
      type:    String,
      default: "",
      trim:    true,
    },
    trackingNumber: {
      type:    String,
      default: "",
    },
    trackingUrl: {
      type:    String,
      default: "",
    },
    status: {
      type:    String,
      enum:    ["processing", "shipped", "in_transit", "delivered", "returned"],
      default: "processing",
    },
    estimatedDelivery: {
      type:    Date,
      default: null,
    },
    shippedAt: {
      type:    Date,
      default: null,
    },
    deliveredAt: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipping", shippingSchema);
