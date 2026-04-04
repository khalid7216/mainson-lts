const express = require("express");
const router = express.Router();
const {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
} = require("../controllers/pageController");

// Assuming admin routes have middleware, for now keeping simple
router.get("/", getPages);
router.get("/:slug", getPageBySlug);
router.post("/", createPage);
router.put("/:id", updatePage);
router.delete("/:id", deletePage);

module.exports = router;
