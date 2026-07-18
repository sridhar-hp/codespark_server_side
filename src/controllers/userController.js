// src/controllers/userController.js
const UserService = require('../services/business/userService');
const { success, error } = require('../utils/responseHandler');

exports.getProfile = async (req, res) => {
  try {
    const user = await UserService.getProfile(req.user.id);
    return success(res, user, 'Profile fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await UserService.updateProfile(req.user.id, req.body);
    return success(res, updated, 'Profile updated');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
