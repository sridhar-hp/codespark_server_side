// src/services/business/achievementService.js
const Achievement = require('../../models/Achievement');
const Task = require('../../models/Task');
const UserStats = require('../../models/UserStats');
const { calculateLevel } = require('../../utils/calculateLevel');
const notificationService = require('./notificationService');

const SYSTEM_ACHIEVEMENTS = [
  // Task Achievements
  {
    key: 'first_step',
    title: 'First Step',
    description: 'Complete 1 task',
    category: 'task',
    icon: 'CheckSquare',
    target: 1,
    targetType: 'task',
    condition: (tasksCount, xp, level) => tasksCount >= 1,
  },
  {
    key: 'task_master',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    category: 'task',
    icon: 'CheckCircle2',
    target: 10,
    targetType: 'task',
    condition: (tasksCount, xp, level) => tasksCount >= 10,
  },
  {
    key: 'productivity_pro',
    title: 'Productivity Pro',
    description: 'Complete 50 tasks',
    category: 'task',
    icon: 'Zap',
    target: 50,
    targetType: 'task',
    condition: (tasksCount, xp, level) => tasksCount >= 50,
  },
  {
    key: 'legend',
    title: 'Legend',
    description: 'Complete 100 tasks',
    category: 'task',
    icon: 'Crown',
    target: 100,
    targetType: 'task',
    condition: (tasksCount, xp, level) => tasksCount >= 100,
  },

  // XP Achievements
  {
    key: 'xp_rookie',
    title: 'Rookie',
    description: 'Earn 100 XP',
    category: 'xp',
    icon: 'Sparkles',
    target: 100,
    targetType: 'xp',
    condition: (tasksCount, xp, level) => xp >= 100,
  },
  {
    key: 'xp_warrior',
    title: 'XP Warrior',
    description: 'Earn 500 XP',
    category: 'xp',
    icon: 'Flame',
    target: 500,
    targetType: 'xp',
    condition: (tasksCount, xp, level) => xp >= 500,
  },
  {
    key: 'xp_master',
    title: 'XP Master',
    description: 'Earn 2,000 XP',
    category: 'xp',
    icon: 'Trophy',
    target: 2000,
    targetType: 'xp',
    condition: (tasksCount, xp, level) => xp >= 2000,
  },
  {
    key: 'xp_god',
    title: 'XP God',
    description: 'Earn 10,000 XP',
    category: 'xp',
    icon: 'Crown',
    target: 10000,
    targetType: 'xp',
    condition: (tasksCount, xp, level) => xp >= 10000,
  },

  // Level Achievements
  {
    key: 'level_5',
    title: 'Level 5',
    description: 'Reach Level 5',
    category: 'level',
    icon: 'Award',
    target: 5,
    targetType: 'level',
    condition: (tasksCount, xp, level) => level >= 5,
  },
  {
    key: 'level_10',
    title: 'Level 10',
    description: 'Reach Level 10',
    category: 'level',
    icon: 'Trophy',
    target: 10,
    targetType: 'level',
    condition: (tasksCount, xp, level) => level >= 10,
  },
  {
    key: 'level_25',
    title: 'Level 25',
    description: 'Reach Level 25',
    category: 'level',
    icon: 'Zap',
    target: 25,
    targetType: 'level',
    condition: (tasksCount, xp, level) => level >= 25,
  },
  {
    key: 'level_50',
    title: 'Level 50',
    description: 'Reach Level 50',
    category: 'level',
    icon: 'Crown',
    target: 50,
    targetType: 'level',
    condition: (tasksCount, xp, level) => level >= 50,
  },
];

class AchievementService {
  static async checkAndUnlock(userId) {
    const tasksCount = await Task.countDocuments({
      $or: [{ user: userId }, { userId: userId }],
      completed: true,
    });
    const stats = await UserStats.findOne({
      $or: [{ user: userId }, { userId: userId }],
    });
    const xp = stats ? stats.totalXP : 0;
    const level = stats ? (stats.level || calculateLevel(xp)) : calculateLevel(xp);

    for (const def of SYSTEM_ACHIEVEMENTS) {
      if (def.condition(tasksCount, xp, level)) {
        const existing = await Achievement.findOne({
          $or: [{ user: userId }, { userId: userId }],
          key: def.key,
        });

        if (!existing) {
          await Achievement.create({
            user: userId,
            userId: userId,
            key: def.key,
            title: def.title,
            description: def.description,
            category: def.category,
            icon: def.icon,
            unlockedAt: new Date(),
          });

          await notificationService.createNotification(userId, {
            title: 'Achievement Unlocked!',
            message: `You unlocked "${def.title}"! ${def.description}`,
            type: 'ACHIEVEMENT',
          });
        }
      }
    }
  }

  static async getAchievements(userId) {
    await this.checkAndUnlock(userId);

    const tasksCount = await Task.countDocuments({
      $or: [{ user: userId }, { userId: userId }],
      completed: true,
    });
    const stats = await UserStats.findOne({
      $or: [{ user: userId }, { userId: userId }],
    });
    const xp = stats ? stats.totalXP : 0;
    const level = stats ? (stats.level || calculateLevel(xp)) : calculateLevel(xp);

    const unlockedDocs = await Achievement.find({
      $or: [{ user: userId }, { userId: userId }],
    }).sort({ unlockedAt: -1, _id: -1 });

    const unlockedMap = new Map();
    unlockedDocs.forEach((doc) => unlockedMap.set(doc.key, doc));

    const achievements = SYSTEM_ACHIEVEMENTS.map((def) => {
      const doc = unlockedMap.get(def.key);
      let currentVal = 0;
      if (def.targetType === 'task') currentVal = tasksCount;
      if (def.targetType === 'xp') currentVal = xp;
      if (def.targetType === 'level') currentVal = level;

      const progress = Math.min(100, Math.round((currentVal / def.target) * 100));
      const isUnlocked = Boolean(doc);

      return {
        id: doc ? doc._id : def.key,
        key: def.key,
        title: def.title,
        description: def.description,
        category: def.category,
        icon: def.icon,
        target: def.target,
        current: currentVal,
        progress: isUnlocked ? 100 : progress,
        progressPct: isUnlocked ? 100 : progress,
        progressLabel: `${currentVal}/${def.target}`,
        isUnlocked: isUnlocked,
        unlocked: isUnlocked,
        unlockedAt: doc ? doc.unlockedAt : null,
      };
    });

    const totalBadges = achievements.length;
    const unlocked = achievements.filter((a) => a.unlocked).length;
    const locked = totalBadges - unlocked;
    const completion = Math.round((unlocked / totalBadges) * 100);

    const latestUnlockedDoc = unlockedDocs[0] || null;
    let latestUnlockedBadge = null;

    if (latestUnlockedDoc) {
      const def = SYSTEM_ACHIEVEMENTS.find((a) => a.key === latestUnlockedDoc.key);
      latestUnlockedBadge = {
        title: latestUnlockedDoc.title,
        description: latestUnlockedDoc.description,
        unlockedAt: latestUnlockedDoc.unlockedAt,
        icon: latestUnlockedDoc.icon,
        category: latestUnlockedDoc.category,
        key: latestUnlockedDoc.key,
        target: def ? def.target : 1,
      };
    }

    const lockedAchievements = achievements.filter((a) => !a.unlocked);
    let nextGoal = null;

    if (lockedAchievements.length > 0) {
      lockedAchievements.sort((a, b) => b.progress - a.progress);
      const nearest = lockedAchievements[0];
      nextGoal = {
        title: nearest.title,
        description: nearest.description,
        progress: nearest.progress,
        progressPct: nearest.progress,
        progressLabel: nearest.progressLabel,
        category: nearest.category,
        icon: nearest.icon,
        key: nearest.key,
        target: nearest.target,
        current: nearest.current,
      };
    }

    return {
      summary: {
        totalBadges,
        unlocked,
        locked,
        completion,
        latestUnlockedBadge,
        nextGoal,
      },
      totalCount: totalBadges,
      unlockedCount: unlocked,
      lockedCount: locked,
      completionRate: completion,
      latestUnlocked: latestUnlockedBadge,
      nextGoal,
      achievements,
    };
  }
}

module.exports = AchievementService;
