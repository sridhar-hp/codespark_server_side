// src/services/business/achievementService.js
const Achievement = require('../../models/Achievement');
const UserAchievement = require('../../models/UserAchievement');
const UserStats = require('../../models/UserStats');
const Task = require('../../models/Task');

const SYSTEM_ACHIEVEMENTS = [
  { key: 'first_task', title: 'First Step', description: 'Complete your first task in CodeSpark', category: 'task', icon: 'CheckSquare' },
  { key: 'task_master_10', title: 'Task Master', description: 'Complete 10 total tasks', category: 'task', icon: 'CheckCircle2' },
  { key: 'xp_novice', title: 'Powering Up', description: 'Earn 100 total XP', category: 'xp', icon: 'Zap' },
  { key: 'xp_pro', title: 'High Performer', description: 'Earn 500 total XP', category: 'xp', icon: 'Sparkles' },
  { key: 'level_up', title: 'Rising Star', description: 'Reach Level 2', category: 'level', icon: 'Crown' },
  { key: 'level_master', title: 'CodeSpark Legend', description: 'Reach Level 5', category: 'level', icon: 'Trophy' },
];

class AchievementService {
  static async checkAndUnlock(userId) {
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
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await UserAchievement.findOneAndUpdate(
          { user: userId, achievement: achDoc._id },
          { user: userId, achievement: achDoc._id },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    return this.getAchievements(userId);
  }

  static async getAchievements(userId) {
    const unlockedDocs = await Achievement.find({ user: userId }).lean();
    const unlockedSet = new Set(unlockedDocs.map((a) => a.key));
    const unlockedDocMap = {};
    unlockedDocs.forEach((d) => { unlockedDocMap[d.key] = d; });

    let stats = await UserStats.findOne({ user: userId });
    const currentXP = stats?.totalXP || 0;
    const currentLevel = stats?.level || 1;
    const completedTasksCount = await Task.countDocuments({ user: userId, status: 'Completed' });

    const totalCount = SYSTEM_ACHIEVEMENTS.length;
    let unlockedCount = 0;

    const achievementsList = SYSTEM_ACHIEVEMENTS.map((sys) => {
      const isUnlocked = unlockedSet.has(sys.key);
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

      return {
        key: sys.key,
        title: sys.title,
        description: sys.description,
        category: sys.category,
        icon: sys.icon,
        isUnlocked,
        unlocked: isUnlocked,
        unlockedAt: unlockedDocMap[sys.key]?.unlockedAt || null,
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
