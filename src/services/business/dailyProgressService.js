// src/services/business/dailyProgressService.js
const DailyProgress = require('../../models/DailyProgress');

class DailyProgressService {
  static async record(userId, { date, tasksCompleted = 0, xpEarned = 0 }) {
    console.log('[DAILY PROGRESS DEBUG] record called for User ID:', userId, 'Date:', date);

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
      console.log('[DAILY PROGRESS DEBUG] DailyProgress updated (existing record):', existing._id);
      return existing;
    }

    const progress = await DailyProgress.create({
      user: userId,
      date: startOfDay,
      tasksCompleted: Number(tasksCompleted) || 0,
      xpEarned: Number(xpEarned) || 0,
    });
    console.log('[DAILY PROGRESS DEBUG] DailyProgress created (new record):', progress._id);
    return progress;
  }

  static async getByDate(userId, date) {
    console.log('[DAILY PROGRESS DEBUG] getByDate called for User ID:', userId, 'Date:', date);

    const targetDate = new Date(date || Date.now());
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const record = await DailyProgress.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!record) {
      console.log('[DAILY PROGRESS DEBUG] No DailyProgress record found for date, returning default payload');
      return {
        user: userId,
        date: startOfDay,
        tasksCompleted: 0,
        xpEarned: 0,
        isDefault: true,
      };
    }

    console.log('[DAILY PROGRESS DEBUG] Found DailyProgress record:', record._id);
    return record;
  }

  static async getRange(userId, start, end) {
    console.log('[DAILY PROGRESS DEBUG] getRange called from', start, 'to', end);

    const startDate = new Date(start);
    const endDate = new Date(end);
    return DailyProgress.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });
  }
}

module.exports = DailyProgressService;
