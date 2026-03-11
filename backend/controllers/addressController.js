// backend/controllers/addressController.js
const Address = require("../models/Address");
const User    = require("../models/User");

/* ── GET /api/addresses ─────────────────────────── */
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort("-isDefault -createdAt");
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/addresses ────────────────────────── */
exports.createAddress = async (req, res) => {
  try {
    const count = await Address.countDocuments({ user: req.user.id });
    const address = await Address.create({
      ...req.body,
      user:      req.user.id,
      isDefault: count === 0, // first address is default
    });

    if (address.isDefault) {
      await User.findByIdAndUpdate(req.user.id, { defaultAddress: address._id });
    }

    res.status(201).json({ address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── PUT /api/addresses/:id ─────────────────────── */
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!address) return res.status(404).json({ message: "Address not found" });

    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { isDefault: false }
      );
      await User.findByIdAndUpdate(req.user.id, { defaultAddress: address._id });
    }

    res.json({ address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── DELETE /api/addresses/:id ──────────────────── */
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: "Address not found" });

    if (address.isDefault) {
      const next = await Address.findOne({ user: req.user.id }).sort("-createdAt");
      if (next) {
        next.isDefault = true;
        await next.save();
        await User.findByIdAndUpdate(req.user.id, { defaultAddress: next._id });
      } else {
        await User.findByIdAndUpdate(req.user.id, { defaultAddress: null });
      }
    }

    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
