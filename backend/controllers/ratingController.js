// backend/controllers/ratingController.js
const Rating  = require("../models/Rating");
const Order   = require("../models/Order");

/* ── GET /api/ratings/product/:productId ────────── */
exports.getProductRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort("-createdAt");

    const stats = await Rating.calcAvgRating(req.params.productId);
    res.json({ ratings, ...stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/ratings ──────────────────────────── */
exports.createRating = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Check if user purchased this product
    const purchased = await Order.findOne({
      user:           req.user.id,
      "items.product": productId,
      status:         { $in: ["paid", "shipped", "delivered"] },
    });

    const review = await Rating.create({
      user:               req.user.id,
      product:            productId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!purchased,
    });

    res.status(201).json({ rating: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    res.status(400).json({ message: err.message });
  }
};

/* ── DELETE /api/ratings/:id ────────────────────── */
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!rating) return res.status(404).json({ message: "Rating not found" });
    res.json({ message: "Rating deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
