// backend/routes/ratingRoutes.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  getProductRatings,
  createRating,
  deleteRating,
} = require("../controllers/ratingController");

router.get("/product/:productId", getProductRatings);
router.post("/",       protect, createRating);
router.delete("/:id",  protect, deleteRating);

module.exports = router;
