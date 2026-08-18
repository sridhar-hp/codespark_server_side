// src/services/business/dailyProgressService.js
const DailyProgress = require('../../models/DailyProgress');

// Helper to format Date or DateString to UTC Midnight Date object (00:00:00.000Z)
function getUTCMidnight(dateInput) {
  const dStr = typeof dateInput === 'string'
    ? dateInput.split('T')[0]
    : new Date(dateInput || Date.now()).toISOString().split('T')[0];
  
  return {
    utcDate: new Date(`${dStr}T00:00:00.000Z`),
    dateStr: dStr,
  };
}

class DailyProgressService {
  static async record(userId, { date, tasksCompleted = 0, xpEarned = 0 }) {
    const { utcDate, dateStr } = getUTCMidnight(date);
    console.log('[DATE DEBUG] Stored Mongo Date (record):', utcDate.toISOString(), 'DateStr:', dateStr);

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    let existing = await DailyProgress.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      existing.tasksCompleted += Number(tasksCompleted) || 0;
      existing.xpEarned += Number(xpEarned) || 0;
      await existing.save();
      console.log('[DAILY PROGRESS DEBUG] DailyProgress updated (existing):', existing._id, 'Tasks:', existing.tasksCompleted, 'XP:', existing.xpEarned);
      return existing;
    }

    const progress = await DailyProgress.create({
      user: userId,
      date: utcDate,
      tasksCompleted: Number(tasksCompleted) || 0,
      xpEarned: Number(xpEarned) || 0,
    });
    console.log('[DAILY PROGRESS DEBUG] DailyProgress created (new):', progress._id);
    return progress;
  }

  static async getByDate(userId, date) {
    const { utcDate, dateStr } = getUTCMidnight(date);
    console.log('[DATE DEBUG] Mongo Query Date (getByDate):', utcDate.toISOString(), 'DateStr:', dateStr);

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const record = await DailyProgress.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!record) {
      console.log('[DAILY PROGRESS DEBUG] No DailyProgress record found for dateStr:', dateStr, 'Returning default');
      return {
        user: userId,
        date: utcDate,
        dateString: dateStr,
        tasksCompleted: 0,
        xpEarned: 0,
        isDefault: true,
      };
    }

    console.log('[DAILY PROGRESS DEBUG] Found DailyProgress record:', record._id, 'Date:', record.date);
    return record;
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
