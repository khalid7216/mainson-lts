// backend/models/Rating.js
const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    rating: {
      type:     Number,
      required: [true, "Rating is required"],
      min:      [1, "Rating must be at least 1"],
      max:      [5, "Rating cannot exceed 5"],
    },
    title: {
      type:    String,
      default: "",
      trim:    true,
      maxlength: 200,
    },
    comment: {
      type:    String,
      default: "",
      trim:    true,
      maxlength: 2000,
    },
    isVerifiedPurchase: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ── One review per user per product ────────────── */
ratingSchema.index({ user: 1, product: 1 }, { unique: true });

/* ── Static: calculate average for a product ────── */
ratingSchema.statics.calcAvgRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id:        "$product",
        avgRating:  { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  return result.length > 0
    ? { avgRating: Math.round(result[0].avgRating * 10) / 10, numReviews: result[0].numReviews }
    : { avgRating: 0, numReviews: 0 };
};

module.exports = mongoose.model("Rating", ratingSchema);
