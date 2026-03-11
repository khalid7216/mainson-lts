// backend/controllers/shippingController.js
const Shipping     = require("../models/Shipping");
const Notification = require("../models/Notification");
const Order        = require("../models/Order");

/* ── GET /api/shipping/order/:orderId ───────────── */
exports.getShippingByOrder = async (req, res) => {
  try {
    const shipping = await Shipping.findOne({ order: req.params.orderId });
    if (!shipping) return res.status(404).json({ message: "No shipping info found" });
    res.json({ shipping });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/shipping (Admin) ─────────────────── */
exports.createShipping = async (req, res) => {
  try {
    const { orderId, carrier, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shipping = await Shipping.create({
      order: orderId,
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      status:    "shipped",
      shippedAt: new Date(),
    });

    order.status = "shipped";
    await order.save();

    await Notification.create({
      user:    order.user,
      type:    "order_update",
      title:   "Order Shipped",
      message: `Your order ${order.orderId} has been shipped via ${carrier}. Tracking: ${trackingNumber}`,
      link:    trackingUrl || "",
    });

    res.status(201).json({ shipping });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── PUT /api/shipping/:id/status (Admin) ───────── */
exports.updateShippingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const shipping = await Shipping.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === "delivered" ? { deliveredAt: new Date() } : {}) },
      { new: true, runValidators: true }
    );
    if (!shipping) return res.status(404).json({ message: "Shipping not found" });

    if (status === "delivered") {
      await Order.findByIdAndUpdate(shipping.order, { status: "delivered" });
    }

    res.json({ shipping });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
