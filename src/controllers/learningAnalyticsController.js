// src/controllers/learningAnalyticsController.js
const LearningAnalyticsService = require('../services/business/learningAnalyticsService');
const { success, error } = require('../utils/responseHandler');

const getAnalytics = async (req, res) => {
  try {
    const analytics = await LearningAnalyticsService.getAnalytics(req.user.id);
    return success(res, analytics, 'Learning analytics retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getHeatmap = async (req, res) => {
  try {
    const heatmap = await LearningAnalyticsService.getHeatmap(req.user.id);
    return success(res, heatmap, 'Learning heatmap retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  getAnalytics,
  getHeatmap,
};
