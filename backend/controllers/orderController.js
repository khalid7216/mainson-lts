// backend/controllers/orderController.js
const Order        = require("../models/Order");
const Cart         = require("../models/Cart");
const Product      = require("../models/Product");
const Notification = require("../models/Notification");
const ActivityLog  = require("../models/ActivityLog");
const Payment      = require("../models/Payment");

/* ── GET /api/orders (user's orders) ────────────── */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort("-createdAt");
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/:id ────────────────────────── */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   POST /api/orders
   ────────────────────────────────────────────────
   SECURE: Server fetches real prices from DB.
   Client only sends [{ productId, qty }].
   Price manipulation is IMPOSSIBLE.
══════════════════════════════════════════════════ */
exports.createOrder = async (req, res) => {
  try {
    const { cartItems, shippingAddress, notes } = req.body;

    // cartItems = [{ productId, qty }]
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    /* ── 1. Fetch REAL prices from DB ──────────── */
    const productIds = cartItems.map((i) => i.productId);
    const products   = await Product.find({ _id: { $in: productIds }, isActive: true });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products are unavailable" });
    }

    const productMap = {};
    products.forEach((p) => (productMap[p._id.toString()] = p));

    /* ── 2. Validate stock & build order items ─── */
    const orderItems = [];
    const stockUpdates = []; // track what to deduct

    for (const ci of cartItems) {
      const product = productMap[ci.productId];
      if (!product) {
        return res.status(400).json({ message: `Product ${ci.productId} not found` });
      }
      if (product.stock < ci.qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${ci.qty}`,
        });
      }

      orderItems.push({
        product: product._id,
        name:    product.name,
        price:   product.price,   // ← SERVER price, not client
        qty:     ci.qty,
        image:   product.images?.[0] || null,
      });

      stockUpdates.push({ id: product._id, deduct: ci.qty });
    }

    /* ── 3. Calculate totals SERVER-SIDE ────────── */
    const subtotal     = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax          = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const shippingCost = subtotal > 200 ? 0 : 15;
    const totalAmount  = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    /* ── 4. Create order ───────────────────────── */
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      totalAmount,
      shippingAddress,
      notes,
    });

    /* ── 5. Deduct stock ───────────────────────── */
    for (const su of stockUpdates) {
      await Product.findByIdAndUpdate(su.id, { $inc: { stock: -su.deduct } });
    }

    /* ── 6. Clear cart ─────────────────────────── */
    await Cart.findOneAndDelete({ user: req.user.id });

    /* ── 7. Notification + ActivityLog ──────────── */
    await Notification.create({
      user:    req.user.id,
      type:    "order_update",
      title:   "Order Placed",
      message: `Your order ${order.orderId} has been placed successfully.`,
      link:    `/profile`,
    });

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

/* ══════════════════════════════════════════════════
   PUT /api/orders/:id/cancel
   ────────────────────────────────────────────────
   Cancels order + restores stock.
   Refund is handled by /api/payments/refund.
══════════════════════════════════════════════════ */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${order.status} order` });
    }

    order.status = "cancelled";
    await order.save();

    /* ── Restore stock ─────────────────────────── */
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

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

/* ══════════════════════════════════════════════════
   POST /api/orders/:id/rollback
   ────────────────────────────────────────────────
   Called via navigator.sendBeacon when user
   leaves/refreshes checkout page mid-payment.
   - Only cancels pending/processing orders
   - Restores product stock
   - Marks linked Payment record as cancelled
   - Idempotent: already cancelled → 200 silently
══════════════════════════════════════════════════ */
exports.rollbackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only the owner can rollback
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If already cancelled / shipped / delivered → skip silently
    if (["cancelled", "shipped", "delivered", "paid"].includes(order.status)) {
      return res.json({ message: "No rollback needed", status: order.status });
    }

    // Only rollback pending or processing orders
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot rollback order with status: ${order.status}` });
    }

    // Cancel the order
    order.status = "cancelled";
    await order.save();

    // Restore stock for each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

    // Cancel linked payment record if it exists and is still pending
    const payment = await Payment.findOne({ order: order._id });
    if (payment && payment.status === "pending") {
      payment.status = "cancelled";
      await payment.save();
    }

    await ActivityLog.create({
      user:       req.user.id,
      action:     "order_rolled_back",
      resource:   "Order",
      resourceId: order._id.toString(),
      ip:         req.ip,
      userAgent:  req.headers["user-agent"],
      details:    { reason: "User left checkout page" },
    });

    res.json({ message: "Order rolled back successfully", orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
