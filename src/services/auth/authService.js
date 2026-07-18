// src/services/auth/authService.js
const User = require('../../models/User');
const generateTokens = require('../../utils/generateToken');
const AuthToken = require('../../models/AuthToken');
const RefreshToken = require('../../models/RefreshToken');

class AuthService {
  static async register({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('User already exists');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.create({ name, email, password });
    const payload = { id: user._id, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);

    // Store tokens for revocation support
    await AuthToken.create({
      user: user._id,
      token: accessToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    });

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { user, accessToken, refreshToken };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const payload = { id: user._id, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);

    await AuthToken.create({
      user: user._id,
      token: accessToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user, accessToken, refreshToken };
  }

  static async refresh({ refreshToken }) {
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) {
      const err = new Error('Refresh token not found');
      err.statusCode = 401;
      throw err;
    }
    if (stored.expiresAt < new Date()) {
      const err = new Error('Refresh token expired');
      err.statusCode = 401;
      throw err;
    }

    const user = await User.findById(stored.user);
    const payload = { id: user._id, role: user.role };
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload);

    // Rotate refresh token
    await RefreshToken.deleteOne({ _id: stored._id });
    await RefreshToken.create({
      user: user._id,
      token: newRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await AuthToken.create({
      user: user._id,
      token: accessToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return { accessToken, refreshToken: newRefresh };
  }

  static async logout({ accessToken }) {
    await AuthToken.deleteOne({ token: accessToken });
    // Front‑end should also delete its stored tokens
  }
}

module.exports = AuthService;
