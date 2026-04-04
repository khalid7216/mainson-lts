const express = require("express");
const router = express.Router();
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

// Assuming admin routes would normally have some sort of protect / authorize middleware
// For this rewrite, we will just use the controller functions
router.get("/", getBanners);
router.post("/", createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;
