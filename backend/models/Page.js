const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", pageSchema);
