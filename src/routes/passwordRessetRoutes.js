// src/routes/passwordResetRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { success, error } = require('../utils/responseHandler');
const PasswordResetToken = require('../models/PasswordResetToken');
const User = require('../models/User');
const crypto = require('crypto');
const mailService = require('../services/external/mailService');

// Request password reset
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return success(res, null, 'If the email exists, a reset link will be sent');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({ user: user._id, token, expiresAt });

    await mailService.sendPasswordReset(email, token); // Assume mailService implements this

    return success(res, null, 'If the email exists, a reset link will be sent');
  } catch (err) {
    return error(res, err);
  }
});

// Reset password
router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const resetDoc = await PasswordResetToken.findOne({ token, used: false });

    if (!resetDoc || resetDoc.expiresAt < new Date()) {
      const err = new Error('Invalid or expired token');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(resetDoc.user);
    user.password = newPassword; // pre‑save hook will hash
    await user.save();

    resetDoc.used = true;
    await resetDoc.save();

    return success(res, null, 'Password has been reset');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
});

module.exports = router;
