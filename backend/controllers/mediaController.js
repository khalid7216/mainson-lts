// backend/controllers/mediaController.js
const Media = require("../models/Media");
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
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
      uploadedBy: req.user._id, // Assume auth middleware sets req.user
    });

    res.status(201).json({ message: "Media uploaded successfully", media });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/media ─────────────────────────────── */
exports.getAllMedia = async (req, res) => {
  try {
    // Optionally implement pagination here if library grows huge
    const media = await Media.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });
    
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
      return res.status(404).json({ message: "Media not found" });
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
