// backend/routes/seoRoutes.js
const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getSeoByPage, upsertSeo, getAllSeo } = require("../controllers/seoController");

// Public — frontend fetches per page
router.get("/:pageName", getSeoByPage);

// Admin Protected — list all SEO configs
router.get("/", protect, adminOnly, getAllSeo);

// Admin Protected — create or update SEO config
router.post("/update", protect, adminOnly, upsertSeo);

module.exports = router;
