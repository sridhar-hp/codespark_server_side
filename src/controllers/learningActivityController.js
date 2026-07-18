// src/controllers/learningActivityController.js
const ActivityService = require('../services/business/activityService');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, res) => {
  try {
    const activity = await ActivityService.create('learning', req.user.id, req.body);
    return success(res, activity, 'Learning activity recorded', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.list = async (req, res) => {
  try {
    const activities = await ActivityService.list('learning', req.user.id);
    return success(res, activities, 'Learning activities fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
