// backend/controllers/notificationController.js
const Notification = require("../models/Notification");

/* ── GET /api/notifications ─────────────────────── */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort("-createdAt")
      .limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/notifications/:id/read ────────────── */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/notifications/read-all ────────────── */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
