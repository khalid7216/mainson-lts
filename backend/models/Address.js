// backend/models/Address.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    label: {
      type:    String,
      default: "Home",
      trim:    true,
    },
    fullName: {
      type:     String,
      required: [true, "Recipient name is required"],
      trim:     true,
    },
    line1: {
      type:     String,
      required: [true, "Address line 1 is required"],
      trim:     true,
    },
    line2: {
      type:    String,
      default: "",
      trim:    true,
    },
    city: {
      type:     String,
      required: [true, "City is required"],
      trim:     true,
    },
    state: {
      type:    String,
      default: "",
      trim:    true,
    },
    postalCode: {
      type:     String,
      required: [true, "Postal code is required"],
      trim:     true,
    },
    country: {
      type:     String,
      required: [true, "Country is required"],
      trim:     true,
    },
    phone: {
      type:    String,
      default: "",
    },
    isDefault: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
