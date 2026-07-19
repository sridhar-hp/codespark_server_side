// src/services/business/achievementService.js
const Achievement = require('../../models/AchievementValidation');
const UserAchievement = require('../../models/UserAchievement');
const XPService = require('./xpService');

class AchievementService {
  static async list() {
    return Achievement.find().sort({ points: -1 });
  }

  static async earn(userId, achievementId) {
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      const err = new Error('Achievement not found');
      err.statusCode = 404;
      throw err;
    }

    // Prevent duplicate earnings
    const exists = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId,
    });
    if (exists) {
      const err = new Error('Achievement already earned');
      err.statusCode = 400;
      throw err;
    }

    await UserAchievement.create({
      user: userId,
      achievement: achievementId,
    });

    // Award XP
    await XPService.addXP(userId, achievement.points);
    return achievement;
  }
}

module.exports = AchievementService;
