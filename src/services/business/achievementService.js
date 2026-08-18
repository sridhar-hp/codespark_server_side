// src/services/business/achievementService.js
const Achievement = require('../../models/Achievement');
const UserAchievement = require('../../models/UserAchievement');
const UserStats = require('../../models/UserStats');
const Task = require('../../models/Task');

const SYSTEM_ACHIEVEMENTS = [
  { key: 'first_task', aliases: ['first_step'], title: 'First Step', description: 'Complete your first task in CodeSpark', category: 'task', icon: 'CheckSquare' },
  { key: 'task_master_10', aliases: [], title: 'Task Master', description: 'Complete 10 total tasks', category: 'task', icon: 'CheckCircle2' },
  { key: 'xp_novice', aliases: ['xp_rookie'], title: 'Powering Up', description: 'Earn 100 total XP', category: 'xp', icon: 'Zap' },
  { key: 'xp_pro', aliases: ['xp_explorer', 'xp_warrior'], title: 'High Performer', description: 'Earn 500 total XP', category: 'xp', icon: 'Sparkles' },
  { key: 'level_up', aliases: [], title: 'Rising Star', description: 'Reach Level 2', category: 'level', icon: 'Crown' },
  { key: 'level_master', aliases: ['level_5', 'level_10', 'level_25', 'xp_master'], title: 'CodeSpark Legend', description: 'Reach Level 5', category: 'level', icon: 'Trophy' },
];

class AchievementService {
  static async checkAndUnlock(userId) {
    console.log('[ACH DEBUG] checkAndUnlock called for User ID:', userId);

    let stats = await UserStats.findOne({ user: userId });
    const currentXP = stats?.totalXP || 0;
    const currentLevel = stats?.level || 1;
    const completedTasksCount = await Task.countDocuments({ user: userId, status: 'Completed' });

    const unlockedMap = {};
    if (completedTasksCount >= 1) unlockedMap['first_task'] = true;
    if (completedTasksCount >= 10) unlockedMap['task_master_10'] = true;
    if (currentXP >= 100) unlockedMap['xp_novice'] = true;
    if (currentXP >= 500) unlockedMap['xp_pro'] = true;
    if (currentLevel >= 2) unlockedMap['level_up'] = true;
    if (currentLevel >= 5) unlockedMap['level_master'] = true;

    for (const sysAch of SYSTEM_ACHIEVEMENTS) {
      if (unlockedMap[sysAch.key]) {
        const achDoc = await Achievement.findOneAndUpdate(
          { user: userId, key: sysAch.key },
          {
            user: userId,
            key: sysAch.key,
            title: sysAch.title,
            description: sysAch.description,
            category: sysAch.category,
            icon: sysAch.icon,
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        const ua = await UserAchievement.findOneAndUpdate(
          { user: userId, achievement: achDoc._id },
          { user: userId, achievement: achDoc._id },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        console.log('[ACH DEBUG] UserAchievement check/update:', ua._id, 'key:', sysAch.key);
      }
    }

    return this.getAchievements(userId);
  }

  static async getAchievements(userId) {
    const mongoAchDocs = await Achievement.find({ user: userId }).lean();
    console.log('[ACH DEBUG] Mongo Achievement Count:', mongoAchDocs.length);

    const unlockedSet = new Set();
    const unlockedDocMap = {};

    mongoAchDocs.forEach((a) => {
      unlockedSet.add(a.key);
      unlockedDocMap[a.key] = a;
    });

    let stats = await UserStats.findOne({ user: userId });
    const currentXP = stats?.totalXP || 0;
    const currentLevel = stats?.level || 1;
    const completedTasksCount = await Task.countDocuments({ user: userId, status: 'Completed' });

    const totalCount = SYSTEM_ACHIEVEMENTS.length;
    let unlockedCount = 0;

    const achievementsList = SYSTEM_ACHIEVEMENTS.map((sys) => {
      // Check direct key or any legacy alias match
      const hasDirect = unlockedSet.has(sys.key);
      const hasAlias = (sys.aliases || []).some((aliasKey) => unlockedSet.has(aliasKey));
      const autoUnlockByStats = (
        (sys.key === 'xp_novice' && currentXP >= 100) ||
        (sys.key === 'xp_pro' && currentXP >= 500) ||
        (sys.key === 'level_up' && currentLevel >= 2) ||
        (sys.key === 'level_master' && currentLevel >= 5) ||
        (sys.key === 'first_task' && completedTasksCount >= 1) ||
        (sys.key === 'task_master_10' && completedTasksCount >= 10)
      );

      const isUnlocked = hasDirect || hasAlias || autoUnlockByStats;
      if (isUnlocked) unlockedCount++;

      let progressLabel = 'Locked';
      let progressPct = 0;

      if (sys.key === 'first_task') {
        progressPct = Math.min(100, Math.round((completedTasksCount / 1) * 100));
        progressLabel = `${completedTasksCount}/1 task`;
      } else if (sys.key === 'task_master_10') {
        progressPct = Math.min(100, Math.round((completedTasksCount / 10) * 100));
        progressLabel = `${completedTasksCount}/10 tasks`;
      } else if (sys.key === 'xp_novice') {
        progressPct = Math.min(100, Math.round((currentXP / 100) * 100));
        progressLabel = `${currentXP}/100 XP`;
      } else if (sys.key === 'xp_pro') {
        progressPct = Math.min(100, Math.round((currentXP / 500) * 100));
        progressLabel = `${currentXP}/500 XP`;
      } else if (sys.key === 'level_up') {
        progressPct = Math.min(100, Math.round((currentLevel / 2) * 100));
        progressLabel = `Level ${currentLevel}/2`;
      } else if (sys.key === 'level_master') {
        progressPct = Math.min(100, Math.round((currentLevel / 5) * 100));
        progressLabel = `Level ${currentLevel}/5`;
      }

      const matchingDoc = unlockedDocMap[sys.key] || (sys.aliases || []).map(k => unlockedDocMap[k]).find(Boolean);

      return {
        key: sys.key,
        title: sys.title,
        description: sys.description,
        category: sys.category,
        icon: sys.icon,
        isUnlocked,
        unlocked: isUnlocked,
        unlockedAt: matchingDoc?.unlockedAt || new Date().toISOString(),
        progressLabel,
        progressPct,
      };
    });

    const lockedCount = totalCount - unlockedCount;
    const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    const unlockedItems = achievementsList.filter((a) => a.isUnlocked);
    const lockedItems = achievementsList.filter((a) => !a.isUnlocked);

    const latestUnlocked = unlockedItems.length > 0 ? unlockedItems[unlockedItems.length - 1] : null;
    const nextGoal = lockedItems.length > 0 ? lockedItems[0] : null;

    console.log('[ACH DEBUG] Unlocked count:', unlockedCount, 'Total:', totalCount, 'Completion Rate:', completionRate + '%');

    return {
      unlockedCount,
      totalCount,
      lockedCount,
      completionRate,
      latestUnlocked,
      nextGoal,
      achievements: achievementsList,
    };
  }
}

module.exports = AchievementService;
