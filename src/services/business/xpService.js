// src/services/business/xpService.js
const UserStats = require('../../models/UserStats');
const { calculateLevel } = require('../../utils/calculateLevel');
const notificationService = require('./notificationService');
const activityService = require('./activityService');

class XPService {
  static async addXP(userId, amount) {
    if (!userId) return null;

    const stats = await UserStats.findOneAndUpdate(
      { $or: [{ user: userId }, { userId: userId }] },
      {
        $inc: { totalXP: amount },
        $setOnInsert: { user: userId, userId: userId, level: 1, streak: 0, tasksCompleted: 0, achievementsEarned: 0 },
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    try {
      await activityService.createActivity(userId, {
        activityType: 'XP_EARNED',
        module: 'xp',
        title: 'XP Earned',
        description: `+${amount} XP awarded`,
        icon: 'Sparkles',
        color: 'amber',
      });
    } catch (actErr) {
      console.error('[XP LOG WARNING]', actErr.message);
    }

    const newLevel = calculateLevel(stats ? stats.totalXP : amount);
    if (stats && newLevel !== stats.level) {
      stats.level = newLevel;
      await stats.save();

      try {
        await notificationService.createNotification(userId, {
          title: 'Level Up!',
          message: `Congratulations! You reached Level ${newLevel}!`,
          type: 'XP',
        });
      } catch (notifErr) {
        console.error('[XP NOTIF WARNING]', notifErr.message);
      }
    }
    return stats;
  }

  static async deductXP(userId, amount) {
    const stats = await UserStats.findOne({
      $or: [{ user: userId }, { userId: userId }],
    });
    if (!stats) return null;
    stats.totalXP = Math.max(0, stats.totalXP - amount);
    stats.level = calculateLevel(stats.totalXP);
    await stats.save();
    return stats;
  }
}

module.exports = XPService;
