// backend/controllers/authController.js
// ═════════════════════════════════════════════════════════════
//  UPDATED: Added password reuse prevention + new endpoints
// ═════════════════════════════════════════════════════════════

const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/* ── Helper: Send token response ─────────────────── */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: true,        // ✅ always true (HTTPS pe hai)
    sameSite: "none",   // ✅ strict → none (cross-origin cookies allow)
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

/* ══════════════════════════════════════════════════
   POST /api/auth/signup
══════════════════════════════════════════════════ */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════════════════════════════════════════════
   POST /api/auth/login
══════════════════════════════════════════════════ */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════════════════════════════════════════════
   GET /api/auth/me
══════════════════════════════════════════════════ */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════════════════════════════════════════════
   POST /api/auth/logout
══════════════════════════════════════════════════ */
exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none", // ✅ logout cookie bhi cross-origin kaam kare
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

/* ══════════════════════════════════════════════════
   POST /api/auth/forgot-password
══════════════════════════════════════════════════ */
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with that email" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request — Maison Élite",
        message,
      });
      res
        .status(200)
        .json({ success: true, message: "Reset link sent to email" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(500)
        .json({ success: false, message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════════════════════════════════════════════
   PUT /api/auth/reset-password/:token
══════════════════════════════════════════════════ */
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const isSamePassword = await user.comparePassword(req.body.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════════════════════════════════════════════
   PUT /api/auth/update-profile
══════════════════════════════════════════════════ */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════════════════════════════════════════════
   PUT /api/auth/change-password
══════════════════════════════════════════════════ */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};