// src/controllers/achievementController.js
const AchievementService = require('../services/business/achievementService');
const { success, error } = require('../utils/responseHandler');

exports.list = async (req, res) => {
  try {
    const data = await AchievementService.getAchievements(req.user.id);
    return success(res, data, 'Achievements fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.check = async (req, res) => {
  try {
    const data = await AchievementService.checkAndUnlock(req.user.id);
    return success(res, data, 'Achievements checked and updated');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
