// backend/controllers/mediaController.js
const Media   = require("../models/Media");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/* ── POST /api/media/upload  (supports 1–10 files) ─── */
exports.uploadMedia = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const { categoryId } = req.body;
    if (!files.length) return res.status(400).json({ message: "No files provided" });

    let folderName = "maison_lite/media";
    if (categoryId) {
        const Category = require("../models/Category");
        const category = await Category.findById(categoryId);
        if (category) folderName = `maison_lite/media/${category.slug}`;
    }

    const saved = [];
    for (const file of files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: folderName,
        });
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        const media = await Media.create({
          url:        result.secure_url,
          public_id:  result.public_id,
          format:     result.format,
          size:       result.bytes,
          uploadedBy: req.user._id,
          category:   categoryId || null,
        });
        saved.push(media);
      } catch (err) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        // skip failed files but continue others
      }
    }

    if (!saved.length) return res.status(500).json({ message: "All uploads failed" });
    res.status(201).json({ message: `${saved.length} file(s) uploaded`, media: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/media  (?search=&sort=&source=) ─────── */
exports.getAllMedia = async (req, res) => {
  try {
    const { search = "", sort = "newest", source, categoryId } = req.query;

    // 1. Library uploads
    let libraryQuery = Media.find();
    if (categoryId && categoryId !== "All") {
      libraryQuery = libraryQuery.where("category", categoryId);
    }
    if (search) {
      libraryQuery = libraryQuery.where("public_id", new RegExp(search, "i"));
    }
    const libraryItems = await libraryQuery
      .populate("uploadedBy", "name email")
      .lean();

    // 2. Product images
    const productFilter = { "image.url": { $exists: true, $ne: null } };
    if (categoryId && categoryId !== "All") {
      productFilter.parentCategory = categoryId;
    }
    if (search) productFilter.name = new RegExp(search, "i");

    const products = await Product.find(productFilter, {
      name: 1, image: 1, createdAt: 1,
    }).lean();

    const productItems = products
      .filter((p) => p.image?.url)
      .map((p) => ({
        _id:         p._id,
        url:         p.image.url,
        public_id:   p.image.publicId || null,
        format:      (p.image.url?.split(".").pop()?.split("?")[0] || "jpg").substring(0, 4),
        size:        null,
        source:      "product",
        productName: p.name,
        createdAt:   p.createdAt,
      }));

    // 3. Merge with source tag
    let media = [
      ...libraryItems.map((m) => ({ ...m, source: "library" })),
      ...productItems,
    ];

    // 4. Filter by source
    if (source && source !== "all") {
      media = media.filter((m) => m.source === source);
    }

    // 5. Sort
    media.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      if (sort === "oldest")   return da - db;
      if (sort === "name")     return (a.productName || a.public_id || "").localeCompare(b.productName || b.public_id || "");
      if (sort === "size")     return (b.size || 0) - (a.size || 0);
      return db - da; // newest (default)
    });

    res.json({ media });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/media/:id ──────────────────────── */
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Not found in library. Product images must be deleted via Products section." });
    }
    if (media.public_id) await cloudinary.uploader.destroy(media.public_id);
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/media/bulk ─────────────────────── */
exports.bulkDeleteMedia = async (req, res) => {
  try {
    const { ids } = req.body; // array of MongoDB IDs
    if (!ids || !ids.length) return res.status(400).json({ message: "No IDs provided" });

    const items = await Media.find({ _id: { $in: ids } });
    for (const item of items) {
      if (item.public_id) {
        try { await cloudinary.uploader.destroy(item.public_id); } catch (_) {}
      }
    }
    await Media.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${items.length} item(s) deleted`, deleted: ids });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
