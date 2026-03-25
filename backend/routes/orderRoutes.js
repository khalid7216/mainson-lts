// backend/routes/orderRoutes.js
const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getMyOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  rollbackOrder,
} = require("../controllers/orderController");

router.use(protect);

router.get("/",               getMyOrders);
router.get("/:id",            getOrder);
router.post("/",              createOrder);
router.put("/:id/cancel",     cancelOrder);
router.post("/:id/rollback",  rollbackOrder);

// Admin routes
router.get("/admin/all",            adminOnly, getAllOrders);
router.put("/admin/:id/status",     adminOnly, updateOrderStatus);

module.exports = router;

