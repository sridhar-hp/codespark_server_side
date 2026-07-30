// src/controllers/leetcodeController.js
const LeetCodeService = require('../services/business/leetcodeService');
const { success, error } = require('../utils/responseHandler');

const connectLeetCode = async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    const result = await LeetCodeService.connectUsername(req.user.id, leetcodeUsername);
    return success(res, result, 'LeetCode account connected successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getLeetCodeProfile = async (req, res) => {
  try {
    const forceSync = req.query.forceSync === 'true';
    const data = await LeetCodeService.getProfile(req.user.id, forceSync);
    return success(res, data, 'LeetCode profile fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getLeetCodeActivity = async (req, res) => {
  try {
    const data = await LeetCodeService.getActivity(req.user.id);
    return success(res, data, 'LeetCode activity fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getLeetCodeStats = async (req, res) => {
  try {
    const data = await LeetCodeService.getStats(req.user.id);
    return success(res, data, 'LeetCode statistics fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const syncLeetCode = async (req, res) => {
  try {
    const data = await LeetCodeService.syncUserLeetCode(req.user.id);
    return success(res, data, 'LeetCode data synchronized');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  connectLeetCode,
  getLeetCodeProfile,
  getLeetCodeActivity,
  getLeetCodeStats,
  syncLeetCode,
  connect: connectLeetCode,
  getProfile: getLeetCodeProfile,
  getActivity: getLeetCodeActivity,
  getStats: getLeetCodeStats,
  sync: syncLeetCode,
};
