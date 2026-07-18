// src/controllers/communicationActivityController.js
const ActivityService = require('../services/business/activityService');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, res) => {
  try {
    const activity = await ActivityService.create('communication', req.user.id, req.body);
    return success(res, activity, 'Communication activity recorded', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.list = async (req, res) => {
  try {
    const activities = await ActivityService.list('communication', req.user.id);
    return success(res, activities, 'Communication activities fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
