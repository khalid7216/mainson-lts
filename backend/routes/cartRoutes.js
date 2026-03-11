// backend/routes/cartRoutes.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

router.use(protect); // All cart routes require auth

router.get("/",              getCart);
router.post("/add",          addToCart);
router.put("/item/:itemId",  updateCartItem);
router.delete("/item/:itemId", removeCartItem);
router.delete("/",           clearCart);

module.exports = router;
