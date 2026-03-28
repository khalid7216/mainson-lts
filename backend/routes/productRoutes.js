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
const upload = require("../middleware/multer");

router.get("/",         getProducts);
router.get("/:slug",    getProductBySlug);
router.post("/",        protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id",      protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id",   protect, adminOnly, deleteProduct);

module.exports = router;
