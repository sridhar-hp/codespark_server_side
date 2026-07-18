// src/controllers/achievementController.js
const AchievementService = require('../services/business/achievementService');
const { success, error } = require('../utils/responseHandler');

exports.list = async (req, res) => {
  try {
    const achievements = await AchievementService.list();
    return success(res, achievements, 'Achievements listed');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.earn = async (req, res) => {
  try {
    const achievement = await AchievementService.earn(
      req.user.id,
      req.params.id
    );
    return success(res, achievement, 'Achievement earned');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
