// backend/controllers/paymentController.js
const Order        = require("../models/Order");
const Payment      = require("../models/Payment");
const Product      = require("../models/Product");
const Notification = require("../models/Notification");
const ActivityLog  = require("../models/ActivityLog");

/*
 * NOTE: Stripe is conditionally loaded.
 * If STRIPE_SECRET_KEY is not set, payment endpoints will return a setup message.
 */
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

/* ══════════════════════════════════════════════════
   POST /api/payments/create-intent
   ────────────────────────────────────────────────
   Creates Stripe PaymentIntent from server-side
   order total. Amount comes from DB, NOT client.
══════════════════════════════════════════════════ */
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
    if (order.status === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Cannot pay for a cancelled order" });
    }

    // ✅ Amount from DB order, NOT from client
    const amountInCents = Math.round(order.totalAmount * 100);

    if (amountInCents < 50) {
      return res.status(400).json({ message: "Order amount too small for payment processing" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInCents,
      currency: "usd",
      metadata: { orderId: order._id.toString(), userId: req.user.id },
    });

    // Check if payment record already exists (re-attempt)
    let payment = await Payment.findOne({ order: order._id });
    if (payment) {
      payment.stripePaymentIntentId = paymentIntent.id;
      payment.amount = amountInCents;
      payment.status = "pending";
      await payment.save();
    } else {
      payment = await Payment.create({
        order:                 order._id,
        user:                  req.user.id,
        stripePaymentIntentId: paymentIntent.id,
        amount:                amountInCents,
        status:                "pending",
      });
    }

    order.status = "processing";
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   POST /api/payments/refund
   ────────────────────────────────────────────────
   ANTI-ABUSE PROTECTIONS:
   1. Only refund if payment.status === "succeeded"
   2. Reject if payment.refundId exists (double refund)
   3. Only order owner can request refund
   4. Cannot refund shipped/delivered orders
══════════════════════════════════════════════════ */
exports.refundPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    /* ── Guard: cannot refund shipped/delivered ── */
    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot refund a ${order.status} order` });
    }

    /* ── Find payment record ─────────────────── */
    const payment = await Payment.findOne({ order: order._id });
    if (!payment) {
      return res.status(404).json({ message: "No payment found for this order" });
    }

    /* ── Guard: only refund succeeded payments ── */
    if (payment.status !== "succeeded") {
      return res.status(400).json({
        message: `Cannot refund — payment status is "${payment.status}". Only succeeded payments can be refunded.`,
      });
    }

    /* ── Guard: prevent double refund ─────────── */
    if (payment.refundId) {
      return res.status(400).json({
        message: "This order has already been refunded. Refund ID: " + payment.refundId,
      });
    }

    /* ── Process refund via Stripe ────────────── */
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    /* ── Update payment record ───────────────── */
    payment.status       = "refunded";
    payment.refundId     = refund.id;
    payment.refundReason = reason || "Customer requested cancellation";
    await payment.save();

    /* ── Cancel the order ────────────────────── */
    order.status = "cancelled";
    await order.save();

    /* ── Restore stock ───────────────────────── */
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

    /* ── Notification + ActivityLog ───────────── */
    await Notification.create({
      user:    req.user.id,
      type:    "order_update",
      title:   "Refund Processed",
      message: `Your refund for order ${order.orderId} has been processed. Amount: $${(payment.amount / 100).toFixed(2)}.`,
      link:    `/profile`,
    });

    await ActivityLog.create({
      user:       req.user.id,
      action:     "order_cancelled",
      resource:   "Payment",
      resourceId: payment._id.toString(),
      ip:         req.ip,
      userAgent:  req.headers["user-agent"],
      details:    { refundId: refund.id, amount: payment.amount },
    });

    res.json({
      success: true,
      message: "Refund processed successfully",
      refundId: refund.id,
      amount:   payment.amount / 100,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   POST /api/payments/webhook
   ────────────────────────────────────────────────
   Stripe webhook handler.
   - payment_intent.succeeded → mark paid
   - payment_intent.payment_failed → mark failed, restore stock
══════════════════════════════════════════════════ */
exports.stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(503).json({ message: "Stripe not configured" });

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  /* ── Payment Succeeded ───────────────────────── */
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const payment = await Payment.findOne({ stripePaymentIntentId: pi.id });
    if (payment) {
      payment.status = "succeeded";
      payment.method = pi.payment_method_types?.[0] || "card";
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order) {
        order.status = "paid";
        await order.save();

        await Notification.create({
          user:    order.user,
          type:    "order_update",
          title:   "Payment Confirmed",
          message: `Payment for order ${order.orderId} confirmed. Total: $${(payment.amount / 100).toFixed(2)}.`,
          link:    `/profile`,
        });
      }
    }
  }

  /* ── Payment Failed ──────────────────────────── */
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const payment = await Payment.findOne({ stripePaymentIntentId: pi.id });
    if (payment) {
      payment.status = "failed";
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order && order.status !== "cancelled") {
        order.status = "cancelled";
        await order.save();

        // Restore stock on payment failure
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
        }

        await Notification.create({
          user:    order.user,
          type:    "order_update",
          title:   "Payment Failed",
          message: `Payment for order ${order.orderId} failed. Your order has been cancelled and stock restored.`,
        });
      }
    }
  }

  res.json({ received: true });
};

/* ══════════════════════════════════════════════════
   GET /api/payments/verify/:orderId
   ────────────────────────────────────────────────
   Verifies payment from DB. If Payment is still
   "pending" (webhook not fired yet in local dev),
   directly calls Stripe to get the real status and
   updates DB accordingly.
══════════════════════════════════════════════════ */
exports.verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const payment = await Payment.findOne({ order: order._id });

    // No Payment record = COD order — verified if not cancelled
    if (!payment) {
      return res.json({
        verified:    order.status !== "cancelled",
        status:      order.status,
        orderStatus: order.status,
      });
    }

    // Already conclusive in DB
    if (["succeeded", "failed", "cancelled", "refunded"].includes(payment.status)) {
      return res.json({
        verified:    payment.status === "succeeded",
        status:      payment.status,
        orderStatus: order.status,
      });
    }

    // Payment is still "pending" — ask Stripe directly (works without webhook)
    if (stripe && payment.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

      if (pi.status === "succeeded") {
        // Update DB to reflect real status
        payment.status = "succeeded";
        payment.method = pi.payment_method_types?.[0] || "card";
        await payment.save();

        order.status = "paid";
        await order.save();

        return res.json({ verified: true, status: "succeeded", orderStatus: "paid" });
      }

      if (pi.status === "canceled" || pi.status === "payment_failed") {
        payment.status = "failed";
        await payment.save();
        return res.json({ verified: false, status: "failed", orderStatus: order.status });
      }
    }

    // Still pending (unlikely after client-side confirm)
    res.json({ verified: false, status: payment.status, orderStatus: order.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
