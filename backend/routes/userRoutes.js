const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getAllUsers } = require("../controllers/userController");

router.get("/admin/all", protect, adminOnly, getAllUsers);

module.exports = router;
