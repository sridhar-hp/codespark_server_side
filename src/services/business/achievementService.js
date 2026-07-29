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
    key: 'xp_explorer',
    title: 'Explorer',
    description: 'Earn 500 XP',
    category: 'xp',
    icon: 'Compass',
    target: 500,
    targetType: 'xp',
    condition: (tasksCount, xp, level) => xp >= 500,
  },
  {
    key: 'xp_champion',
    title: 'Champion',
    description: 'Earn 1000 XP',
    category: 'xp',
    icon: 'Award',
    target: 1000,
    targetType: 'xp',
    condition: (tasksCount, xp, level) => xp >= 1000,
  },
  {
    key: 'xp_master',
    title: 'Master',
    description: 'Earn 5000 XP',
    category: 'xp',
    icon: 'Star',
    target: 5000,
    targetType: 'xp',
    condition: (tasksCount, xp, level) => xp >= 5000,
  },

  // Level Achievements
  {
    key: 'level_5',
    title: 'Level 5',
    description: 'Reach Level 5',
    category: 'level',
    icon: 'Trophy',
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
    icon: 'Shield',
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
    // 1. Evaluate conditions and auto-unlock
    await this.checkAndUnlock(userId);

    // 2. Fetch live metrics from MongoDB
    const tasksCount = await Task.countDocuments({ user: userId, completed: true });
    const stats = await UserStats.findOne({ user: userId });
    const xp = stats ? stats.totalXP : 0;
    const level = stats ? stats.level : 1;

    // 3. Fetch unlocked achievements for user from MongoDB
    const unlockedDocs = await Achievement.find({ user: userId }).sort({ unlockedAt: -1, _id: -1 });
    const unlockedMap = new Map();
    unlockedDocs.forEach((doc) => unlockedMap.set(doc.key, doc));

    // 4. Map achievements with live progress
    const achievements = SYSTEM_ACHIEVEMENTS.map((def) => {
      const doc = unlockedMap.get(def.key);
      let currentVal = 0;
      if (def.targetType === 'task') currentVal = tasksCount;
      if (def.targetType === 'xp') currentVal = xp;
      if (def.targetType === 'level') currentVal = level;

      const progressPct = Math.min(100, Math.max(0, Math.round((currentVal / def.target) * 100)));

      let progressLabel = '';
      if (def.targetType === 'task') progressLabel = `${currentVal} / ${def.target} tasks`;
      if (def.targetType === 'xp') progressLabel = `${currentVal} / ${def.target} XP`;
      if (def.targetType === 'level') progressLabel = `Level ${currentVal} / ${def.target}`;

      return {
        key: def.key,
        title: def.title,
        description: def.description,
        category: def.category,
        icon: def.icon,
        unlocked: !!doc,
        unlockedAt: doc ? doc.unlockedAt : null,
        current: currentVal,
        target: def.target,
        targetType: def.targetType,
        progressPct,
        progressLabel,
      };
    });

    // 5. Calculate summary statistics strictly from system & MongoDB records
    const totalCount = achievements.length;
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const lockedCount = Math.max(0, totalCount - unlockedCount);
    const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    // 6. Latest Unlocked Badge (newest unlockedAt timestamp from MongoDB)
    const latestDoc = unlockedDocs[0] || null;
    const latestUnlocked = latestDoc
      ? achievements.find((a) => a.key === latestDoc.key) || null
      : null;

    // 7. Next Goal: Nearest locked achievement based on current Task count, XP, or Level
    const lockedList = achievements.filter((a) => !a.unlocked);
    lockedList.sort((a, b) => {
      if (b.progressPct !== a.progressPct) {
        return b.progressPct - a.progressPct; // Highest completion % first
      }
      // Secondary sort: smallest remaining distance to target
      const remainingA = Math.max(0, a.target - a.current);
      const remainingB = Math.max(0, b.target - b.current);
      return remainingA - remainingB;
    });
    const nextGoal = lockedList[0] || null;

    return {
      totalCount,
      unlockedCount,
      lockedCount,
      completionRate,
      latestUnlocked,
      nextGoal,
      achievements,
    };
  }
}

module.exports = AchievementService;
