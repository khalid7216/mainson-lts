const Banner = require("../models/Banner");

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error", message: error.message });
  }
};

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(", ") });
    }
    res.status(500).json({ success: false, error: "Server Error", message: error.message });
  }
};

// Update a banner
exports.updateBanner = async (req, res) => {
  try {
    let banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, error: "Banner not found" });
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // This runs Mongoose validation on update
    });

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(", ") });
    }
    res.status(500).json({ success: false, error: "Server Error", message: error.message });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, error: "Banner not found" });
    }

    await banner.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error", message: error.message });
  }
};
