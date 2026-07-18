// src/services/business/xpService.js
const UserStats = require('../../models/UserStats');
const { calculateLevel } = require('../../utils/calculateLevel');

class XPService {
  static async addXP(userId, amount) {
    const stats = await UserStats.findOneAndUpdate(
      { user: userId },
      { $inc: { totalXP: amount } },
      { new: true, upsert: true }
    );

    const newLevel = calculateLevel(stats.totalXP);
    if (newLevel !== stats.level) {
      stats.level = newLevel;
      await stats.save();
    }
    return stats;
  }

  static async deductXP(userId, amount) {
    // Ensure totalXP never goes below zero
    const stats = await UserStats.findOne({ user: userId });
    if (!stats) return null;
    stats.totalXP = Math.max(0, stats.totalXP - amount);
    stats.level = calculateLevel(stats.totalXP);
    await stats.save();
    return stats;
  }
}

module.exports = XPService;
