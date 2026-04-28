const express = require("express");
const router  = express.Router();
const { handleChat } = require("../controllers/chatbotController");
const rateLimit = require("express-rate-limit");

// Basic rate limiting — max 20 requests per IP per minute
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." }
});

router.post("/message", chatbotLimiter, handleChat);

module.exports = router;
