// backend/routes/paymentRoutes.js
const router  = require("express").Router();
const express = require("express");
const { protect } = require("../middleware/auth");
const { createPaymentIntent, refundPayment, stripeWebhook } = require("../controllers/paymentController");

// Webhook needs raw body — must be before JSON parser
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

router.use(protect);
router.post("/create-intent", createPaymentIntent);
router.post("/refund",        refundPayment);

module.exports = router;

