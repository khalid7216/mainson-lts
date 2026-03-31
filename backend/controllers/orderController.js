// backend/controllers/orderController.js
const mongoose     = require("mongoose");
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
   Uses ATOMIC TRANSACTIONS for stock/cart/order.
══════════════════════════════════════════════════ */
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cartItems, shippingAddress, notes } = req.body;

    if (!cartItems || cartItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No items in order" });
    }

    /* ── 1. Fetch REAL prices from DB (within session) ── */
    const productIds = cartItems.map((i) => i.productId);
    const products   = await Product.find({ _id: { $in: productIds }, isActive: true }).session(session);

    if (products.length !== productIds.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "One or more products are unavailable or inactive" });
    }

    const productMap = {};
    products.forEach((p) => (productMap[p._id.toString()] = p));

    /* ── 2. Validate stock & build order items ─── */
    const orderItems = [];
    const stockUpdates = [];

    for (const ci of cartItems) {
      const product = productMap[ci.productId];
      if (!product) {
        throw new Error(`Product ${ci.productId} not found during transaction`);
      }
      if (product.stock < ci.qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${ci.qty}`,
        });
      }

      orderItems.push({
        product: product._id,
        name:    product.name,
        price:   product.price,
        qty:     ci.qty,
        image:   product.images?.[0] || null,
      });

      stockUpdates.push({ id: product._id, deduct: ci.qty });
    }

    /* ── 3. Calculate totals ───────────────────── */
    const subtotal     = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax          = Math.round(subtotal * 0.08 * 100) / 100;
    const shippingCost = subtotal > 200 ? 0 : 15;
    const totalAmount  = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    /* ── 4. Create order (within session) ──────── */
    const [order] = await Order.create([{
      user: req.user.id,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      totalAmount,
      shippingAddress,
      notes,
      status: "pending"
    }], { session });

    /* ── 5. Deduct stock (within session) ──────── */
    for (const su of stockUpdates) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: su.id, stock: { $gte: su.deduct } },
        { $inc: { stock: -su.deduct } },
        { session, new: true }
      );
      if (!updatedProduct) {
        throw new Error("Concurrency error: Product stock changed during checkout. Please try again.");
      }
    }

    /* ── 6. Clear cart (within session) ────────── */
    await Cart.findOneAndDelete({ user: req.user.id }, { session });

    // Commit all changes
    await session.commitTransaction();
    session.endSession();

    /* ── 7. Notification + ActivityLog (Outside Transaction) ── */
    // Note: We do these AFTER commit so they don't block the transaction
    try {
      await Notification.create({
        user:    req.user.id,
        type:    "order_update",
        title:   "Order Started",
        message: `Your order ${order.orderId} is being processed. Please complete payment.`,
        link:    `/profile`,
      });

      await ActivityLog.create({
        user:       req.user.id,
        action:     "order_created",
        resource:   "Order",
        resourceId: order._id.toString(),
        ip:         req.ip,
        userAgent:  req.headers["user-agent"],
      });
    } catch (logErr) {
      console.warn("Log/Notification failed, but order was created:", logErr.message);
    }

    res.status(201).json({ order });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   PUT /api/orders/:id/cancel
   ────────────────────────────────────────────────
   Manual Cancellation by user/admin.
══════════════════════════════════════════════════ */
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }
    
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Cannot cancel a ${order.status} order` });
    }

    order.status = "cancelled";
    await order.save({ session });

    /* ── Restore stock ─────────────────────────── */
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stock: item.qty } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Async tasks
    await Notification.create({
      user:    order.user,
      type:    "order_update",
      title:   "Order Cancelled",
      message: `Order ${order.orderId} has been cancelled.`,
    }).catch(() => {});

    res.json({ order });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
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
    }).catch(() => {});

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   POST /api/orders/:id/rollback
   ────────────────────────────────────────────────
   Handles page refresh/tab close rollback.
══════════════════════════════════════════════════ */
exports.rollbackOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Not authorized" });
    }

    // skip if terminal status
    if (["cancelled", "shipped", "delivered", "paid"].includes(order.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ message: "No rollback needed", status: order.status });
    }

    order.status = "cancelled";
    await order.save({ session });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stock: item.qty } },
        { session }
      );
    }

    // Cancel payment link
    const payment = await Payment.findOne({ order: order._id }).session(session);
    if (payment && payment.status === "pending") {
      payment.status = "cancelled";
      await payment.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    await ActivityLog.create({
      user:       req.user.id,
      action:     "order_rolled_back",
      resource:   "Order",
      resourceId: order._id.toString(),
      details:    { reason: "Checkout interruption" },
    }).catch(() => {});

    res.json({ message: "Order rolled back successfully" });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   GET /api/orders/admin/analytics (Admin)
   ────────────────────────────────────────────────
   Analytics details for Admin Dashboard
══════════════════════════════════════════════════ */
exports.getAdminAnalytics = async (req, res) => {
  try {
    const validStatuses = ["delivered", "paid", "shipped", "processing"];
    
    // Quick summary
    const summary = await Order.aggregate([
      { $match: { status: { $in: validStatuses } } },
      { $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
      }}
    ]);

    const metrics = summary[0] || { totalRevenue: 0, totalOrders: 0 };
    const avgOrder = metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(2) : 0;

    // Revenue Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trendAgg = await Order.aggregate([
      { $match: { 
          status: { $in: validStatuses },
          createdAt: { $gte: sixMonthsAgo }
      }},
      { $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = [];
    const data = [];
    
    let curr = new Date(sixMonthsAgo);
    for (let i = 0; i < 6; i++) {
        labels.push(months[curr.getMonth()]);
        data.push(0);
        curr.setMonth(curr.getMonth() + 1);
    }
    
    trendAgg.forEach(t => {
      const mName = months[t._id.month - 1];
      const idx = labels.indexOf(mName);
      if (idx !== -1) {
          data[idx] = t.revenue;
      }
    });

    res.json({
        totalRevenue: metrics.totalRevenue,
        totalOrders: metrics.totalOrders,
        avgOrder: Number(avgOrder),
        chart: { labels, data }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
