// backend/models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    theme: {
      type:    String,
      enum:    ["dark", "light"],
      default: "dark",
    },
    language: {
      type:    String,
      default: "en",
    },
    currency: {
      type:    String,
      default: "USD",
      uppercase: true,
    },
    emailNotifications: {
      type:    Boolean,
      default: true,
    },
    pushNotifications: {
      type:    Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
