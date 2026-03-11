// backend/controllers/cartController.js
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

/* ── GET /api/cart ──────────────────────────────── */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name slug price images stock");
    if (!cart) cart = { user: req.user.id, items: [] };
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/cart/add ─────────────────────────── */
exports.addToCart = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const existingIdx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (existingIdx > -1) {
      cart.items[existingIdx].qty += qty;
      cart.items[existingIdx].priceSnapshot = product.price;
    } else {
      cart.items.push({ product: productId, qty, priceSnapshot: product.price });
    }

    await cart.save();
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/cart/item/:itemId ─────────────────── */
exports.updateCartItem = async (req, res) => {
  try {
    const { qty } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    if (qty <= 0) {
      item.deleteOne();
    } else {
      item.qty = qty;
    }
    await cart.save();
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/cart/item/:itemId ──────────────── */
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.deleteOne();
    await cart.save();
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/cart ───────────────────────────── */
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
