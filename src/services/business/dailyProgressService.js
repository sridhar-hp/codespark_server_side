// src/services/business/dailyProgressService.js
const DailyProgress = require('../../models/DailyProgress');

class DailyProgressService {
  static async record(userId, { date, tasksCompleted = 0, xpEarned = 0 }) {
    const targetDate = new Date(date || Date.now());
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    let existing = await DailyProgress.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      existing.tasksCompleted += Number(tasksCompleted) || 0;
      existing.xpEarned += Number(xpEarned) || 0;
      await existing.save();
      console.log('[HEATMAP DEBUG] DailyProgress updated (existing):', existing._id);
      return existing;
    }

    const progress = await DailyProgress.create({
      user: userId,
      date: startOfDay,
      tasksCompleted: Number(tasksCompleted) || 0,
      xpEarned: Number(xpEarned) || 0,
    });
    console.log('[HEATMAP DEBUG] DailyProgress updated (new created):', progress._id);
    return progress;
  }

  static async getByDate(userId, date) {
    const targetDate = new Date(date || Date.now());
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return DailyProgress.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  static async getRange(userId, start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return DailyProgress.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });
  }
}

module.exports = DailyProgressService;
