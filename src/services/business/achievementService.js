// src/services/business/achievementService.js
const Achievement = require('../../models/Achievement');
const Task = require('../../models/Task');
const UserStats = require('../../models/UserStats');

const SYSTEM_ACHIEVEMENTS = [
  // Task Achievements
  {
    key: 'first_step',
    title: 'First Step',
    description: 'Complete 1 task',
    category: 'task',
    icon: 'CheckSquare',
    condition: (tasksCount, xp, level) => tasksCount >= 1,
  },
  {
    key: 'task_master',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    category: 'task',
    icon: 'CheckCircle2',
    condition: (tasksCount, xp, level) => tasksCount >= 10,
  },
  {
    key: 'productivity_pro',
    title: 'Productivity Pro',
    description: 'Complete 50 tasks',
    category: 'task',
    icon: 'Zap',
    condition: (tasksCount, xp, level) => tasksCount >= 50,
  },
  {
    key: 'legend',
    title: 'Legend',
    description: 'Complete 100 tasks',
    category: 'task',
    icon: 'Crown',
    condition: (tasksCount, xp, level) => tasksCount >= 100,
  },

  // XP Achievements
  {
    key: 'xp_rookie',
    title: 'Rookie',
    description: 'Earn 100 XP',
    category: 'xp',
    icon: 'Sparkles',
    condition: (tasksCount, xp, level) => xp >= 100,
  },
  {
    key: 'xp_explorer',
    title: 'Explorer',
    description: 'Earn 500 XP',
    category: 'xp',
    icon: 'Compass',
    condition: (tasksCount, xp, level) => xp >= 500,
  },
  {
    key: 'xp_champion',
    title: 'Champion',
    description: 'Earn 1000 XP',
    category: 'xp',
    icon: 'Award',
    condition: (tasksCount, xp, level) => xp >= 1000,
  },
  {
    key: 'xp_master',
    title: 'Master',
    description: 'Earn 5000 XP',
    category: 'xp',
    icon: 'Star',
    condition: (tasksCount, xp, level) => xp >= 5000,
  },

  // Level Achievements
  {
    key: 'level_5',
    title: 'Level 5',
    description: 'Reach Level 5',
    category: 'level',
    icon: 'Trophy',
    condition: (tasksCount, xp, level) => level >= 5,
  },
  {
    key: 'level_10',
    title: 'Level 10',
    description: 'Reach Level 10',
    category: 'level',
    icon: 'Trophy',
    condition: (tasksCount, xp, level) => level >= 10,
  },
  {
    key: 'level_25',
    title: 'Level 25',
    description: 'Reach Level 25',
    category: 'level',
    icon: 'Shield',
    condition: (tasksCount, xp, level) => level >= 25,
  },
  {
    key: 'level_50',
    title: 'Level 50',
    description: 'Reach Level 50',
    category: 'level',
    icon: 'Crown',
    condition: (tasksCount, xp, level) => level >= 50,
  },
];

class AchievementService {
  static async checkAndUnlock(userId) {
    const tasksCount = await Task.countDocuments({ user: userId, completed: true });
    const stats = await UserStats.findOne({ user: userId });
    const xp = stats ? stats.totalXP : 0;
    const level = stats ? stats.level : 1;

    for (const def of SYSTEM_ACHIEVEMENTS) {
      if (def.condition(tasksCount, xp, level)) {
        const existing = await Achievement.findOne({ user: userId, key: def.key });
        if (!existing) {
          await Achievement.create({
            user: userId,
            key: def.key,
            title: def.title,
            description: def.description,
            category: def.category,
            icon: def.icon,
            unlockedAt: new Date(),
          });
        }
      }
    }
  }

  static async getAchievements(userId) {
    await this.checkAndUnlock(userId);
    const unlockedDocs = await Achievement.find({ user: userId });
    const unlockedMap = new Map();
    unlockedDocs.forEach((doc) => unlockedMap.set(doc.key, doc));

    const achievements = SYSTEM_ACHIEVEMENTS.map((def) => {
      const doc = unlockedMap.get(def.key);
      return {
        key: def.key,
        title: def.title,
        description: def.description,
        category: def.category,
        icon: def.icon,
        unlocked: !!doc,
        unlockedAt: doc ? doc.unlockedAt : null,
      };
    });

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return {
      unlockedCount,
      totalCount: achievements.length,
      achievements,
    };
  }
}

module.exports = AchievementService;
