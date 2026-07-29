// src/services/business/analyticsService.js
const Task = require('../../models/Task');
const UserStats = require('../../models/UserStats');

class AnalyticsService {
  static async getOverview(userId) {
    const tasks = await Task.find({ user: userId });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedTasksList = tasks.filter((t) => t.completed);

    const tasksCompletedToday = completedTasksList.filter(
      (t) => new Date(t.updatedAt || t.createdAt) >= startOfToday
    ).length;

    const tasksCompletedThisWeek = completedTasksList.filter(
      (t) => new Date(t.updatedAt || t.createdAt) >= startOfWeek
    ).length;

    const tasksCompletedThisMonth = completedTasksList.filter(
      (t) => new Date(t.updatedAt || t.createdAt) >= startOfMonth
    ).length;

    let stats = await UserStats.findOne({ user: userId });
    const totalXP = stats ? stats.totalXP : 0;
    const currentLevel = stats ? stats.level : 1;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      tasksCompletedToday,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      totalXP,
      currentLevel,
    };
  }
}

module.exports = AnalyticsService;
