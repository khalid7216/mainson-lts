// backend/routes/chatbotRoutes.js
const express = require("express");
const router  = express.Router();
const { handleChat } = require("../controllers/chatbotController");
const { protect } = require("../middleware/auth");

// We can protect it if we want only logged in users to use it, or leave it public but with a lower rate limit.
// Let's protect it to ensure we know who is talking.
router.post("/", protect, handleChat);

module.exports = router;
