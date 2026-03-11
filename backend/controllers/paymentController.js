// backend/controllers/paymentController.js
const Order   = require("../models/Order");
const Payment = require("../models/Payment");

/*
 * NOTE: Stripe is conditionally loaded.
 * If STRIPE_SECRET_KEY is not set, payment endpoints will return a setup message.
 */
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

/* ── POST /api/payments/create-intent ───────────── */
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env" });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const amountInCents = Math.round(order.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInCents,
      currency: "usd",
      metadata: { orderId: order._id.toString(), userId: req.user.id },
    });

    // Create payment record
    await Payment.create({
      order:                 order._id,
      user:                  req.user.id,
      stripePaymentIntentId: paymentIntent.id,
      amount:                amountInCents,
      status:                "pending",
    });

    order.status = "processing";
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/payments/webhook ─────────────────── */
exports.stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(503).json({ message: "Stripe not configured" });

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const payment = await Payment.findOne({ stripePaymentIntentId: pi.id });
    if (payment) {
      payment.status = "succeeded";
      payment.method = pi.payment_method_types?.[0] || "card";
      await payment.save();

      await Order.findByIdAndUpdate(payment.order, { status: "paid" });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const payment = await Payment.findOne({ stripePaymentIntentId: pi.id });
    if (payment) {
      payment.status = "failed";
      await payment.save();

      await Order.findByIdAndUpdate(payment.order, { status: "pending" });
    }
  }

  res.json({ received: true });
};
