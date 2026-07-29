// src/controllers/analyticsController.js
const AnalyticsService = require('../services/business/analyticsService');
const { success, error } = require('../utils/responseHandler');

exports.fetch = async (req, res) => {
  try {
    const data = await AnalyticsService.getOverview(req.user.id);
    return success(res, data, 'Analytics overview fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.generate = async (req, res) => {
  try {
    const data = await AnalyticsService.getOverview(req.user.id);
    return success(res, data, 'Analytics generated', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
