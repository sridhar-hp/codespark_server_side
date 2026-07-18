// src/controllers/analyticsController.js
const Analytics = require('../models/Analytics');
const { success, error } = require('../utils/responseHandler');

exports.generate = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.body;
    // Simple aggregation – can be expanded.
    const pipeline = [
      { $match: { user: req.user.id, createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      {
        $group: {
          _id: null,
          totalXP: { $sum: '$xpEarned' },
          tasksCompleted: { $sum: '$tasksCompleted' },
          achievementsEarned: { $sum: 1 },
        },
      },
    ];
    const result = await Analytics.aggregate(pipeline);
    const analytics = await Analytics.create({
      user: req.user.id,
      period,
      startDate,
      endDate,
      ...(result[0] || {}),
    });
    return success(res, analytics, 'Analytics generated');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.fetch = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user: req.user.id }).sort({ createdAt: -1 });
    return success(res, analytics, 'Analytics fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
