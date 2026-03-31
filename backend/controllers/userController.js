const User = require("../models/User");
const Order = require("../models/Order");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    
    // Aggregate successful orders for total spent & count
    const orderStats = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "paid", "shipped", "processing", "pending"] } } },
      { $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" }
      }}
    ]);

    const statsMap = {};
    orderStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });

    const enrichedUsers = users.map(u => {
      const orders = statsMap[u._id.toString()]?.totalOrders || 0;
      const spent = statsMap[u._id.toString()]?.totalSpent || 0;
      let tier = "NEW";
      if (spent > 2000) tier = "VIP";
      else if (spent > 1000) tier = "ELITE";
      else if (orders > 0) tier = "ACTIVE";

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        joined: u.createdAt,
        orders,
        spent,
        tier
      };
    });

    res.json({ users: enrichedUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
