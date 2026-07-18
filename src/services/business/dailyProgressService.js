// src/services/business/dailyProgressService.js
const DailyProgress = require('../../models/DailyProgress');

class DailyProgressService {
  static async record(userId, { date, tasksCompleted = 0, xpEarned = 0 }) {
    const existing = await DailyProgress.findOne({ user: userId, date });
    if (existing) {
      existing.tasksCompleted += tasksCompleted;
      existing.xpEarned += xpEarned;
      await existing.save();
      return existing;
    }
    const progress = await DailyProgress.create({
      user: userId,
      date,
      tasksCompleted,
      xpEarned,
    });
    return progress;
  }

  static async getByDate(userId, date) {
    return DailyProgress.findOne({ user: userId, date });
  }

  static async getRange(userId, start, end) {
    return DailyProgress.find({
      user: userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });
  }
}

module.exports = DailyProgressService;
