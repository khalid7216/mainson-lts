// backend/models/ActivityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null, // null = system event
    },
    action: {
      type:     String,
      required: true,
      enum: [
        "login",
        "logout",
        "signup",
        "order_placed",
        "order_cancelled",
        "password_changed",
        "settings_updated",
        "profile_updated",
        "admin_action",
      ],
    },
    resource: {
      type:    String,
      default: "",
    },
    resourceId: {
      type:    String,
      default: "",
    },
    ip: {
      type:    String,
      default: "",
    },
    userAgent: {
      type:    String,
      default: "",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

/* ── TTL: auto-delete after 90 days ─────────────── */
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

/* ── Index for user lookups ─────────────────────── */
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
