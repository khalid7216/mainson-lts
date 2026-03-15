// backend/routes/activityLogRoutes.js
const express = require("express");
const router  = express.Router();
const { getActivityLogs, getMyActivityLogs } = require("../controllers/activityLogController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/",   protect, adminOnly, getActivityLogs);
router.get("/my", protect, getMyActivityLogs);

module.exports = router;
