// src/services/business/learningAnalyticsService.js
const StudySession = require('../../models/StudySession');
const Learning = require('../../models/Learning');

class LearningAnalyticsService {
  /**
   * Calculate full learning analytics for the authenticated user.
   */
  static async getAnalytics(userId) {
    const userQuery = { $or: [{ user: userId }, { userId: userId }] };

    // Fetch all courses and study sessions
    const courses = await Learning.find(userQuery);
    const sessions = await StudySession.find(userQuery)
      .populate('learningId')
      .sort({ studyDate: -1 });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let todayMinutes = 0;
    let yesterdayMinutes = 0;
    let weeklyMinutes = 0;
    let monthlyMinutes = 0;
    let totalSessionMinutes = 0;
    let longestSessionMinutes = 0;

    const activeDaysSet = new Set();

    sessions.forEach((s) => {
      const mins = s.durationMinutes || 0;
      totalSessionMinutes += mins;
      if (mins > longestSessionMinutes) {
        longestSessionMinutes = mins;
      }

      if (s.studyDate) {
        const d = new Date(s.studyDate);
        const dateStr = d.toISOString().split('T')[0];
        activeDaysSet.add(dateStr);

        if (dateStr === todayStr) {
          todayMinutes += mins;
        }
        if (dateStr === yesterdayStr) {
          yesterdayMinutes += mins;
        }
        if (d >= sevenDaysAgo) {
          weeklyMinutes += mins;
        }
        if (d >= thirtyDaysAgo) {
          monthlyMinutes += mins;
        }
      }
    });

    // Courses summary
    const completedCoursesCount = courses.filter((c) => c.status === 'Completed').length;
    const activeCoursesCount = courses.filter((c) => c.status === 'In Progress').length;
    const totalCoursesCount = courses.length;
    const completionRatePct = totalCoursesCount > 0
      ? Math.round((completedCoursesCount / totalCoursesCount) * 100)
      : 0;

    // Platform & Category distributions
    const platformMap = {};
    const categoryMap = {};

    courses.forEach((c) => {
      const p = c.platform || 'Other';
      const cat = c.category || 'Other';
      const hours = c.completedHours || 0;

      if (!platformMap[p]) platformMap[p] = { count: 0, hours: 0 };
      platformMap[p].count += 1;
      platformMap[p].hours += hours;

      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, hours: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].hours += hours;
    });

    const totalCourseHours = courses.reduce((acc, c) => acc + (c.completedHours || 0), 0);

    const platformDistribution = Object.keys(platformMap).map((key) => ({
      name: key,
      count: platformMap[key].count,
      hours: Math.round(platformMap[key].hours * 10) / 10,
      percent: totalCoursesCount > 0 ? Math.round((platformMap[key].count / totalCoursesCount) * 100) : 0,
    }));

    const categoryDistribution = Object.keys(categoryMap).map((key) => ({
      name: key,
      count: categoryMap[key].count,
      hours: Math.round(categoryMap[key].hours * 10) / 10,
      percent: totalCoursesCount > 0 ? Math.round((categoryMap[key].count / totalCoursesCount) * 100) : 0,
    }));

    // Streaks calculation
    const sortedActiveDates = Array.from(activeDaysSet).sort((a, b) => new Date(b) - new Date(a));
    let currentStreakDays = 0;
    let longestStreakDays = 0;
    let tempStreak = 0;

    let checkDate = new Date(todayStr);
    if (!activeDaysSet.has(todayStr) && activeDaysSet.has(yesterdayStr)) {
      checkDate = new Date(yesterdayStr);
    }

    while (activeDaysSet.has(checkDate.toISOString().split('T')[0])) {
      currentStreakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < sortedActiveDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedActiveDates[i - 1]);
        const curr = new Date(sortedActiveDates[i]);
        const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreakDays) {
        longestStreakDays = tempStreak;
      }
    }

    const activeDaysCount = activeDaysSet.size || 1;
    const totalHoursFloat = totalSessionMinutes / 60;
    const averageDailyHours = Math.round((totalHoursFloat / activeDaysCount) * 10) / 10;

    const recentSessions = sessions.slice(0, 10).map((s) => ({
      id: s._id,
      courseTitle: s.learningId ? s.learningId.title : 'General Study',
      durationMinutes: s.durationMinutes,
      studyDate: s.studyDate,
      notes: s.notes,
    }));

    const courseProgressSummary = courses.map((c) => ({
      id: c._id,
      title: c.title,
      platform: c.platform,
      category: c.category,
      completedHours: c.completedHours,
      totalHours: c.totalHours,
      progress: c.progress,
      status: c.status,
    }));

    return {
      todayMinutes,
      todayHours: Math.round((todayMinutes / 60) * 10) / 10,
      yesterdayMinutes,
      yesterdayHours: Math.round((yesterdayMinutes / 60) * 10) / 10,
      weeklyMinutes,
      weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
      monthlyMinutes,
      monthlyHours: Math.round((monthlyMinutes / 60) * 10) / 10,
      totalLearningHours: Math.round(totalHoursFloat * 10) / 10,
      totalMinutes: totalSessionMinutes,
      averageDailyHours,
      longestSessionMinutes,
      currentStreakDays,
      longestStreakDays: Math.max(currentStreakDays, longestStreakDays),
      completedCoursesCount,
      activeCoursesCount,
      totalCoursesCount,
      completionRatePct,
      platformDistribution,
      categoryDistribution,
      recentSessions,
      courseProgressSummary,
    };
  }

  /**
   * Generate 365-day GitHub-style study heatmap data.
   */
  static async getHeatmap(userId) {
    const userQuery = { $or: [{ user: userId }, { userId: userId }] };
    const sessions = await StudySession.find(userQuery);

    const minutesMap = {};
    sessions.forEach((s) => {
      if (s.studyDate) {
        const dateStr = new Date(s.studyDate).toISOString().split('T')[0];
        minutesMap[dateStr] = (minutesMap[dateStr] || 0) + (s.durationMinutes || 0);
      }
    });

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 365);

    const heatmap = [];
    for (let i = 0; i <= 365; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const minutes = minutesMap[dateStr] || 0;
      const hours = Math.round((minutes / 60) * 10) / 10;

      let intensity = 0;
      if (minutes > 120) intensity = 4;
      else if (minutes > 60) intensity = 3;
      else if (minutes > 30) intensity = 2;
      else if (minutes > 0) intensity = 1;

      heatmap.push({
        date: dateStr,
        minutes,
        hours,
        intensity,
      });
    }

    return heatmap;
  }
}

module.exports = LearningAnalyticsService;
