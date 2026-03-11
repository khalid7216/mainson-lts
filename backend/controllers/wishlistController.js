// backend/controllers/wishlistController.js
const Wishlist = require("../models/Wishlist");

/* ── GET /api/wishlist ──────────────────────────── */
exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user.id })
      .populate("product", "name slug price images badge")
      .sort("-createdAt");
    res.json({ wishlist: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/wishlist/toggle ──────────────────── */
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({ user: req.user.id, product: productId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ message: "Removed from wishlist", added: false });
    }

    await Wishlist.create({ user: req.user.id, product: productId });
    res.json({ message: "Added to wishlist", added: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
