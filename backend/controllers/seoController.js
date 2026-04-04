// backend/controllers/seoController.js
const SeoConfig = require("../models/SeoConfig");

/* ─────────────────────────────────────────────────────────
   GET /api/seo/:pageName
   Public — frontend fetches this on every page load
───────────────────────────────────────────────────────── */
exports.getSeoByPage = async (req, res) => {
  try {
    const { pageName } = req.params;

    if (!pageName || !pageName.trim()) {
      return res.status(400).json({ success: false, message: "pageName is required" });
    }

    const seo = await SeoConfig.findOne({ pageName: pageName.toLowerCase().trim() });

    if (!seo) {
      // Return sensible defaults so frontend never crashes
      return res.status(200).json({
        success: true,
        seo: {
          pageName: pageName,
          title: "Maison Élite — Luxury Fashion",
          description: "Discover Maison Élite's curated luxury fashion collections. Timeless elegance crafted from the finest materials.",
          keywords: ["luxury fashion", "maison elite", "designer clothing"],
          ogImage: "",
          canonical: "",
          noIndex: false,
        },
        fromDefault: true,
      });
    }

    res.status(200).json({ success: true, seo, fromDefault: false });
  } catch (err) {
    console.error("getSeoByPage error:", err);
    res.status(500).json({ success: false, message: "Server error fetching SEO config" });
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/seo/update
   Admin Protected — upsert SEO data for any page
───────────────────────────────────────────────────────── */
exports.upsertSeo = async (req, res) => {
  try {
    const { pageName, title, description, keywords, ogImage, canonical, noIndex } = req.body;

    // ── Validation ─────────────────────────────────────
    if (!pageName || !pageName.trim()) {
      return res.status(400).json({ success: false, message: "pageName is required" });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "SEO title cannot be empty" });
    }
    if (title.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Title must be at least 5 characters" });
    }
    if (title.trim().length > 70) {
      return res.status(400).json({ success: false, message: "Title must be 70 characters or less" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "SEO description cannot be empty" });
    }
    if (description.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Description must be at least 10 characters" });
    }
    if (description.trim().length > 170) {
      return res.status(400).json({ success: false, message: "Description must be 170 characters or less" });
    }

    // ── Normalise keywords ──────────────────────────────
    let parsedKeywords = [];
    if (typeof keywords === "string") {
      parsedKeywords = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    } else if (Array.isArray(keywords)) {
      parsedKeywords = keywords.map((k) => k.trim()).filter(Boolean);
    }

    // ── Upsert ─────────────────────────────────────────
    const seo = await SeoConfig.findOneAndUpdate(
      { pageName: pageName.toLowerCase().trim() },
      {
        pageName: pageName.toLowerCase().trim(),
        title: title.trim(),
        description: description.trim(),
        keywords: parsedKeywords,
        ogImage: ogImage?.trim() || "",
        canonical: canonical?.trim() || "",
        noIndex: Boolean(noIndex),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `SEO config for "${pageName}" saved successfully`,
      seo,
    });
  } catch (err) {
    console.error("upsertSeo error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({ success: false, message: "Server error saving SEO config" });
  }
};

/* ─────────────────────────────────────────────────────────
   GET /api/seo  (Admin only)
   Returns all SEO configs for the admin dashboard list
───────────────────────────────────────────────────────── */
exports.getAllSeo = async (req, res) => {
  try {
    const configs = await SeoConfig.find().sort({ pageName: 1 });
    res.status(200).json({ success: true, configs });
  } catch (err) {
    console.error("getAllSeo error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
