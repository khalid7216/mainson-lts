const Page = require("../models/Page");

// Get all pages (Admin or public, mostly admin)
exports.getPages = async (req, res, next) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pages.length, data: pages });
  } catch (error) {
    next(error);
  }
};

// Get single page by slug
exports.getPageBySlug = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: "active" });
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found or inactive" });
    }
    res.status(200).json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

// Create a new page
exports.createPage = async (req, res, next) => {
  try {
    let { title, slug, content, status } = req.body;
    
    // Auto-generate slug if not provided
    if (!slug && title) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const newPage = await Page.create({ title, slug, content, status });
    res.status(201).json({ success: true, data: newPage });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Slug already exists. Choose a unique slug." });
    }
    next(error);
  }
};

// Update page
exports.updatePage = async (req, res, next) => {
  try {
    let { title, slug, content, status } = req.body;
    
    if (slug) {
      slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      req.body.slug = slug;
    }

    const page = await Page.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    res.status(200).json({ success: true, data: page });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Slug already exists." });
    }
    next(error);
  }
};

// Delete page
exports.deletePage = async (req, res, next) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }
    res.status(200).json({ success: true, message: "Page deleted" });
  } catch (error) {
    next(error);
  }
};
