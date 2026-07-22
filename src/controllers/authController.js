// src/controllers/authController.js
const AuthService = require('../services/auth/authService');
const { success, error } = require('../utils/responseHandler');

exports.register = async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    return success(res, result, 'User registered');
  } catch (err) {
    console.error(err);
    return error(res, err, err.statusCode || 500);
  }
};

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    return success(res, result, 'Logged in');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.refresh = async (req, res) => {
  try {
    const result = await AuthService.refresh(req.body);
    return success(res, result, 'Token refreshed');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    await AuthService.logout({ accessToken: token });
    return success(res, null, 'Logged out');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
