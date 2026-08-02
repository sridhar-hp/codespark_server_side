// src/services/business/activityService.js
const Activity = require('../../models/Activity');

class ActivityService {
  /**
   * Helper function to safely create an activity record.
   */
  static async createActivity(userId, data) {
    try {
      const {
        activityType,
        title,
        description = '',
        module = 'system',
        icon = 'Zap',
        color = 'amber',
        metadata = {},
      } = data;

      if (!userId || !title || !activityType) return null;

      const activity = new Activity({
        user: userId,
        userId: userId,
        activityType,
        title,
        description,
        module: module.toLowerCase(),
        icon,
        color,
        metadata,
      });

      await activity.save();
      return activity;
    } catch (err) {
      console.error('Activity creation failed silently:', err.message);
      return null;
    }
  }

  /**
   * Get activity timeline for a user with optional module filter (max limit 100).
   */
  static async getTimeline(userId, options = {}) {
    const limit = Math.min(100, parseInt(options.limit, 10) || 100);
    const filter = {
      $or: [{ user: userId }, { userId: userId }],
    };

    if (options.module && options.module.toLowerCase() !== 'all') {
      filter.module = options.module.toLowerCase();
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    const count = await Activity.countDocuments(filter);

    return {
      activities,
      count,
    };
  }

  /**
   * Get top N recent activities for user dashboard feed.
   */
  static async getRecentActivities(userId, limit = 10) {
    return this.getTimeline(userId, { limit });
  }

  /**
   * Clear all activities for a user.
   */
  static async clearUserActivities(userId) {
    const filter = {
      $or: [{ user: userId }, { userId: userId }],
    };

    await Activity.deleteMany(filter);
    return { success: true, message: 'Activity timeline cleared' };
  }
}

module.exports = ActivityService;
