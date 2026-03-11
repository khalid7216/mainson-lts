// backend/controllers/productController.js
const Product  = require("../models/Product");
const Rating   = require("../models/Rating");

/* ── GET /api/products ──────────────────────────── */
exports.getProducts = async (req, res) => {
  try {
    const { category, badge, sort, page = 1, limit = 20, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (badge)    filter.badge = badge;
    if (search)   filter.name = { $regex: search, $options: "i" };

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc")  sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };
    if (sort === "name")       sortObj = { name: 1 };

    const skip  = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/products/:slug ────────────────────── */
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { avgRating, numReviews } = await Rating.calcAvgRating(product._id);
    res.json({ product, avgRating, numReviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/products (Admin) ─────────────────── */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── PUT /api/products/:id (Admin) ──────────────── */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── DELETE /api/products/:id (Admin) ───────────── */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
