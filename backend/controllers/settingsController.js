// backend/controllers/settingsController.js
const Settings    = require("../models/Settings");
const ActivityLog = require("../models/ActivityLog");

/* ── GET /api/settings ──────────────────────────── */
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });
    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/settings ──────────────────────────── */
exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );

    await ActivityLog.create({
      user:      req.user.id,
      action:    "settings_updated",
      resource:  "Settings",
      resourceId: settings._id.toString(),
      ip:        req.ip,
      userAgent: req.headers["user-agent"],
      details:   req.body,
    });

    res.json({ settings });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
