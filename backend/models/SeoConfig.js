// backend/models/SeoConfig.js
const mongoose = require("mongoose");

const SeoConfigSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      required: [true, "pageName is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, "SEO title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [70, "Title must not exceed 70 characters"],
    },
    description: {
      type: String,
      required: [true, "SEO description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [170, "Description must not exceed 170 characters"],
    },
    keywords: {
      type: [String],
      default: [],
    },
    ogImage: {
      type: String,
      default: "",
    },
    canonical: {
      type: String,
      default: "",
    },
    noIndex: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoConfig", SeoConfigSchema);
