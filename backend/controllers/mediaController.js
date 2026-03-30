// backend/controllers/mediaController.js
const Media   = require("../models/Media");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/* ── POST /api/media/upload ─────────────────────── */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "maison_lite/media",
    });

    // Remove temp file from disk
    fs.unlinkSync(req.file.path);

    // Save metadata to DB
    const media = await Media.create({
      url:        result.secure_url,
      public_id:  result.public_id,
      format:     result.format,
      size:       result.bytes,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ message: "Media uploaded successfully", media });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/media ─────────────────────────────── */
// Returns dedicated Media Library items PLUS all product images
exports.getAllMedia = async (req, res) => {
  try {
    // 1. Dedicated media library uploads
    const libraryItems = await Media.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Product images — only products that have an image URL
    const products = await Product.find(
      { "image.url": { $exists: true, $ne: null, $ne: "" } },
      { name: 1, image: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .lean();

    // Normalize product images into the same shape as Media documents
    const productItems = products
      .filter((p) => p.image?.url)
      .map((p) => ({
        _id:        p._id,            // use product's own _id
        url:        p.image.url,
        public_id:  p.image.publicId || null,
        format:     p.image.url?.split(".").pop()?.split("?")[0] || "jpg",
        size:       null,             // product images don't store byte size
        source:     "product",        // distinguish from library uploads
        productName: p.name,
        createdAt:  p.createdAt,
      }));

    // 3. Merge: library items first (newest first), then product images
    const media = [
      ...libraryItems.map((m) => ({ ...m, source: "library" })),
      ...productItems,
    ];

    res.json({ media });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/media/:id ──────────────────────── */
// Only library-uploaded media can be deleted (not product images directly)
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found in library. Product images must be deleted via the Products section." });
    }

    // Attempt to delete it from Cloudinary
    if (media.public_id) {
      await cloudinary.uploader.destroy(media.public_id);
    }

    // Delete from MongoDB
    await Media.findByIdAndDelete(req.params.id);

    res.json({ message: "Media deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
