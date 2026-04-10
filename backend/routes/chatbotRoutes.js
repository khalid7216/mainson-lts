// backend/routes/chatbotRoutes.js
const express = require("express");
const router  = express.Router();
const { handleChat } = require("../controllers/chatbotController");
const { protect } = require("../middleware/auth");

// Make public so guest users can get assistance
router.post("/", handleChat);

module.exports = router;
