// backend/controllers/orderController.js
const Order        = require("../models/Order");
const Cart         = require("../models/Cart");
const Notification = require("../models/Notification");
const ActivityLog  = require("../models/ActivityLog");

/* ── GET /api/orders (user's orders) ────────────── */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("shippingAddress")
      .sort("-createdAt");
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/:id ────────────────────────── */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("shippingAddress");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/orders ───────────────────────────── */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const subtotal     = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax          = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const shippingCost = subtotal > 200 ? 0 : 15;
    const totalAmount  = subtotal + tax + shippingCost;

    const order = await Order.create({
      user: req.user.id,
      items,
      subtotal,
      tax,
      shippingCost,
      totalAmount,
      shippingAddress,
      notes,
    });

    // Clear cart after order
    await Cart.findOneAndDelete({ user: req.user.id });

    // Create notification
    await Notification.create({
      user:    req.user.id,
      type:    "order_update",
      title:   "Order Placed",
      message: `Your order ${order.orderId} has been placed successfully.`,
      link:    `/profile`,
    });

    // Activity log
    await ActivityLog.create({
      user:       req.user.id,
      action:     "order_placed",
      resource:   "Order",
      resourceId: order._id.toString(),
      ip:         req.ip,
      userAgent:  req.headers["user-agent"],
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/orders/:id/cancel ─────────────────── */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel a shipped/delivered order" });
    }

    order.status = "cancelled";
    await order.save();

    await Notification.create({
      user:    req.user.id,
      type:    "order_update",
      title:   "Order Cancelled",
      message: `Order ${order.orderId} has been cancelled.`,
    });

    await ActivityLog.create({
      user:       req.user.id,
      action:     "order_cancelled",
      resource:   "Order",
      resourceId: order._id.toString(),
      ip:         req.ip,
      userAgent:  req.headers["user-agent"],
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/admin/all (Admin) ──────────── */
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip  = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("shippingAddress")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/orders/admin/:id/status (Admin) ───── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    await Notification.create({
      user:    order.user,
      type:    "order_update",
      title:   "Order Updated",
      message: `Your order ${order.orderId} status is now: ${status}.`,
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
