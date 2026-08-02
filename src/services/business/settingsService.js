// src/services/business/settingsService.js
const User = require('../../models/User');
const UserSettings = require('../../models/UserSettings');
const AuthToken = require('../../models/AuthToken');
const RefreshToken = require('../../models/RefreshToken');
const bcrypt = require('bcrypt');

class SettingsService {
  /**
   * Helper to ensure UserSettings document exists for user.
   */
  static async getOrCreateSettings(userId) {
    let settings = await UserSettings.findOne({ user: userId });
    if (!settings) {
      settings = new UserSettings({ user: userId });
      await settings.save();
      await User.findByIdAndUpdate(userId, { settings: settings._id });
    }
    return settings;
  }

  /**
   * Fetch complete profile, settings, preferences, and GitHub connection status.
   */
  static async getSettings(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const settings = await this.getOrCreateSettings(userId);

    const githubSettings = {
      connected: Boolean(user.githubUsername),
      githubUsername: user.githubUsername || '',
      lastSync: user.githubUsername ? 'Synced' : null,
    };

    return {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        location: user.location || '',
        occupation: user.occupation || '',
        role: user.role,
        githubUsername: user.githubUsername || '',
        leetcodeUsername: user.leetcodeUsername || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        createdAt: user.createdAt,
      },
      settings,
      githubSettings,
    };
  }

  /**
   * Update user profile information.
   */
  static async updateProfile(userId, profileData) {
    const allowedFields = [
      'name',
      'phone',
      'avatar',
      'bio',
      'location',
      'occupation',
      'githubUsername',
      'leetcodeUsername',
      'linkedinUrl',
      'githubUrl',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        updates[field] = profileData[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return this.getSettings(userId);
  }

  /**
   * Change user password.
   */
  static async changePassword(userId, { currentPassword, newPassword, confirmPassword }) {
    if (!currentPassword || !newPassword) {
      const err = new Error('Current password and new password are required');
      err.statusCode = 400;
      throw err;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      const err = new Error('New password and confirm password do not match');
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 6) {
      const err = new Error('New password must be at least 6 characters long');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const err = new Error('Incorrect current password');
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: 'Password updated successfully' };
  }

  /**
   * Update notification preferences.
   */
  static async updatePreferences(userId, notificationSettings) {
    const settings = await this.getOrCreateSettings(userId);
    settings.notificationSettings = {
      ...settings.notificationSettings,
      ...notificationSettings,
    };
    await settings.save();
    return this.getSettings(userId);
  }

  /**
   * Update theme and visual studio settings.
   */
  static async updateTheme(userId, themeData) {
    const settings = await this.getOrCreateSettings(userId);
    if (themeData.theme) settings.theme = themeData.theme;
    if (themeData.accent) settings.accent = themeData.accent;
    if (themeData.density) settings.density = themeData.density;
    if (themeData.sidebar) settings.sidebar = themeData.sidebar;
    if (themeData.borderRadius) settings.borderRadius = themeData.borderRadius;
    if (themeData.animation) settings.animation = themeData.animation;

    await settings.save();
    return this.getSettings(userId);
  }

  /**
   * Update privacy settings.
   */
  static async updatePrivacy(userId, privacySettings) {
    const settings = await this.getOrCreateSettings(userId);
    settings.privacySettings = {
      ...settings.privacySettings,
      ...privacySettings,
    };
    await settings.save();
    return this.getSettings(userId);
  }

  /**
   * Update general settings fields.
   */
  static async updateSettings(userId, settingsData) {
    const settings = await this.getOrCreateSettings(userId);
    Object.assign(settings, settingsData);
    await settings.save();
    return this.getSettings(userId);
  }

  /**
   * Revoke current user session token.
   */
  static async logout(accessToken) {
    if (accessToken) {
      await AuthToken.deleteOne({ token: accessToken });
    }
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Revoke all user tokens (Logout from all devices).
   */
  static async logoutAll(userId) {
    await AuthToken.deleteMany({ user: userId });
    await RefreshToken.deleteMany({ user: userId });
    return { success: true, message: 'Logged out from all devices successfully' };
  }
}

module.exports = SettingsService;
