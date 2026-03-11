// backend/routes/productRoutes.js
const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/",         getProducts);
router.get("/:slug",    getProductBySlug);
router.post("/",        protect, adminOnly, createProduct);
router.put("/:id",      protect, adminOnly, updateProduct);
router.delete("/:id",   protect, adminOnly, deleteProduct);

module.exports = router;
