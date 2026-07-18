// src/controllers/linkedinActivityController.js
const ActivityService = require('../services/business/activityService');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, res) => {
  try {
    const activity = await ActivityService.create('linkedin', req.user.id, req.body);
    return success(res, activity, 'LinkedIn activity recorded', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.list = async (req, res) => {
  try {
    const activities = await ActivityService.list('linkedin', req.user.id);
    return success(res, activities, 'LinkedIn activities fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
