// backend/controllers/categoryController.js
const Category = require("../models/Category");
const Product = require("../models/Product");

/* ── GET /api/categories ────────────────────────── */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parent", "name slug").sort("name");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/categories (Admin) ───────────────── */
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── PUT /api/categories/:id (Admin) ────────────── */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── DELETE /api/categories/:id (Admin) ─────────── */
exports.deleteCategory = async (req, res) => {
  try {
    const productsCount = await Product.countDocuments({ parentCategory: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ message: `Cannot delete: ${productsCount} products are linked to this category.` });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
