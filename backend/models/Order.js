// backend/models/Order.js
const mongoose = require("mongoose");
const crypto   = require("crypto");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Product",
    },
    name:  { type: String, required: true },
    price: { type: Number, required: true },
    qty:   { type: Number, required: true, min: 1 },
    image: { type: String, default: null },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type:   String,
      unique: true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    items: {
      type:     [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, "Order must have at least one item"],
    },
    subtotal: {
      type:     Number,
      required: true,
      min:      0,
    },
    tax: {
      type:    Number,
      default: 0,
      min:     0,
    },
    shippingCost: {
      type:    Number,
      default: 0,
      min:     0,
    },
    totalAmount: {
      type:     Number,
      required: true,
      min:      0,
    },
    status: {
      type:    String,
      enum:    ["pending", "processing", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Address",
    },
    notes: {
      type:    String,
      default: "",
    },
  },
  { timestamps: true }
);

/* ── Auto-generate orderId ──────────────────────── */
orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    const rand = crypto.randomInt(1000, 9999);
    this.orderId = `#ME-${rand}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
