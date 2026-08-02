// src/controllers/settingsController.js
const SettingsService = require('../services/business/settingsService');
const { success, error } = require('../utils/responseHandler');

const getSettings = async (req, res) => {
  try {
    const data = await SettingsService.getSettings(req.user.id);
    return success(res, data, 'Settings fetched successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const updateSettings = async (req, res) => {
  try {
    const data = await SettingsService.updateSettings(req.user.id, req.body);
    return success(res, data, 'Settings updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = await SettingsService.updateProfile(req.user.id, req.body);
    return success(res, data, 'Profile updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const data = await SettingsService.changePassword(req.user.id, req.body);
    return success(res, data, 'Password changed successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const updatePreferences = async (req, res) => {
  try {
    const data = await SettingsService.updatePreferences(req.user.id, req.body);
    return success(res, data, 'Notification preferences updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const updateTheme = async (req, res) => {
  try {
    const data = await SettingsService.updateTheme(req.user.id, req.body);
    return success(res, data, 'Theme preferences updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const updatePrivacy = async (req, res) => {
  try {
    const data = await SettingsService.updatePrivacy(req.user.id, req.body);
    return success(res, data, 'Privacy settings updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    const data = await SettingsService.logout(token);
    return success(res, data, 'Logged out successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const logoutAll = async (req, res) => {
  try {
    const data = await SettingsService.logoutAll(req.user.id);
    return success(res, data, 'Logged out from all devices successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  updatePreferences,
  updateTheme,
  updatePrivacy,
  logout,
  logoutAll,
};
