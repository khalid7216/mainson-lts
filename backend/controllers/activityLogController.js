// backend/controllers/activityLogController.js
const ActivityLog = require("../models/ActivityLog");

/* ── GET /api/activity-logs ─────────────────────── */
// Admin: list activity logs with filters
exports.getActivityLogs = async (req, res) => {
  try {
    const { user, action, page = 1, limit = 25 } = req.query;

    const filter = {};
    if (user) filter.user = user;
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── GET /api/activity-logs/my ──────────────────── */
// Authenticated user: view own activity
exports.getMyActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ActivityLog.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
