// src/controllers/dailyProgressController.js
const DailyProgressService = require('../services/business/dailyProgressService');
const { success, error } = require('../utils/responseHandler');

exports.record = async (req, res) => {
  try {
    const progress = await DailyProgressService.record(req.user.id, req.body);
    return success(res, progress, 'Progress recorded', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.getByDate = async (req, res) => {
  try {
    const progress = await DailyProgressService.getByDate(
      req.user.id,
      new Date(req.query.date)
    );
    return success(res, progress, 'Progress fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.getRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const progress = await DailyProgressService.getRange(
      req.user.id,
      new Date(start),
      new Date(end)
    );
    return success(res, progress, 'Progress range fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
