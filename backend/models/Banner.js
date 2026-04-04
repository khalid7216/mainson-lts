const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Banner title is required"],
    },
    type: {
      type: String,
      enum: ["Banner", "Slider"],
      required: [true, "Banner type is required"],
    },
    section: {
      type: String,
      required: [true, "Banner section is required"],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    image: {
      url: { type: String, required: [true, "Image URL is required"] },
      publicId: { type: String, required: false }, // for Cloudinary
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
