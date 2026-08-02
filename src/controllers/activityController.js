// src/controllers/activityController.js
const ActivityService = require('../services/business/activityService');
const { success, error } = require('../utils/responseHandler');

const getTimeline = async (req, res) => {
  try {
    const { limit, module: moduleFilter } = req.query;
    const result = await ActivityService.getTimeline(req.user.id, {
      limit,
      module: moduleFilter,
    });
    return success(res, result, 'Activity timeline fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await ActivityService.getRecentActivities(req.user.id, limit);
    return success(res, result, 'Recent activities fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const clearActivity = async (req, res) => {
  try {
    const result = await ActivityService.clearUserActivities(req.user.id);
    return success(res, result, 'Activity timeline cleared');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  getTimeline,
  getRecent,
  clearActivity,
};
