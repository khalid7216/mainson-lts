// backend/routes/shippingRoutes.js
const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getShippingByOrder,
  createShipping,
  updateShippingStatus,
} = require("../controllers/shippingController");

router.use(protect);

router.get("/order/:orderId",   getShippingByOrder);
router.post("/",                adminOnly, createShipping);
router.put("/:id/status",       adminOnly, updateShippingStatus);

module.exports = router;
