// backend/controllers/productController.js
const Product  = require("../models/Product");
const Rating   = require("../models/Rating");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/* ── GET /api/products ──────────────────────────── */
exports.getProducts = async (req, res) => {
  try {
    const { category, badge, sort, page = 1, limit = 20, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== "All") filter.parentCategory = category;
    if (badge)    filter.badge = badge;
    
    if (search) {
      const sanitizedSearch = search.trim();
      if (sanitizedSearch) {
        const regex = new RegExp(sanitizedSearch, "i");
        
        // Find matching categories by name first since parentCategory is an ObjectId
        const Category = require("../models/Category");
        const matchingCategories = await Category.find({ name: regex }).select("_id");
        const categoryIds = matchingCategories.map(c => c._id);

        filter.$or = [
          { name: regex },
          { description: regex },
          { tags: regex },
          { subCategory: regex }
        ];

        if (categoryIds.length > 0) {
          filter.$or.push({ parentCategory: { $in: categoryIds } });
        }
      }
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc")  sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };
    if (sort === "name")       sortObj = { name: 1 };

    const skip  = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("parentCategory", "name slug")
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
      .populate("parentCategory", "name slug");
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
    let productData = { ...req.body };
    
    // Parse arrays/JSON strings from FormData
    if (productData.sizes && typeof productData.sizes === "string") productData.sizes = JSON.parse(productData.sizes);
    if (productData.colors && typeof productData.colors === "string") productData.colors = JSON.parse(productData.colors);
    if (productData.tags && typeof productData.tags === "string") productData.tags = productData.tags.split(',').map(t => t.trim());

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "maison_lite/products"
      });
      productData.image = {
        url: result.secure_url,
        publicId: result.public_id
      };
      fs.unlinkSync(req.file.path);
    }

    const product = await Product.create(productData);
    res.status(201).json({ product });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: err.message });
  }
};

/* ── PUT /api/products/:id (Admin) ──────────────── */
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };
    delete updateData._id; // Prevent updating immutable ID
    
    // Parse arrays/JSON strings from FormData
    if (updateData.sizes && typeof updateData.sizes === "string") updateData.sizes = JSON.parse(updateData.sizes);
    if (updateData.colors && typeof updateData.colors === "string") updateData.colors = JSON.parse(updateData.colors);
    if (updateData.tags && typeof updateData.tags === "string") updateData.tags = updateData.tags.split(',').map(t => t.trim());

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "maison_lite/products"
      });
      updateData.image = {
        url: result.secure_url,
        publicId: result.public_id
      };
      fs.unlinkSync(req.file.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
