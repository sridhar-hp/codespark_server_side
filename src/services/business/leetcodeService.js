// src/services/business/leetcodeService.js
const User = require('../../models/User');
const LeetCodeData = require('../../models/LeetCodeData');
const LeetCodeApiService = require('../external/leetcodeApiService');

class LeetCodeService {
  static async connectUsername(userId, username) {
    if (!username || typeof username !== 'string' || !username.trim()) {
      const err = new Error('LeetCode username is required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.trim();

    // 1. Fetch live LeetCode Data
    const liveData = await LeetCodeApiService.fetchUserData(cleanUsername);

    // 2. Save username to User document
    await User.findByIdAndUpdate(userId, { leetcodeUsername: cleanUsername }, { new: true });

    // 3. Cache payload to LeetCodeData MongoDB collection
    await LeetCodeData.findOneAndUpdate(
      { user: userId },
      {
        leetcodeUsername: cleanUsername,
        lastSync: new Date(),
        cachedProfile: liveData.profile,
        cachedStats: liveData.stats,
        cachedActivity: liveData.submissionCalendar,
        cachedSubmissions: liveData.submissions,
      },
      { upsert: true, new: true }
    );

    return {
      connected: true,
      leetcodeUsername: cleanUsername,
      profile: liveData.profile,
      stats: liveData.stats,
      submissions: liveData.submissions,
      submissionCalendar: liveData.submissionCalendar,
    };
  }

  static async syncUserLeetCode(userId) {
    const user = await User.findById(userId);
    if (!user || !user.leetcodeUsername) {
      return {
        connected: false,
        profile: null,
        stats: null,
        submissions: [],
        submissionCalendar: {},
      };
    }

    const liveData = await LeetCodeApiService.fetchUserData(user.leetcodeUsername);

    await LeetCodeData.findOneAndUpdate(
      { user: userId },
      {
        leetcodeUsername: user.leetcodeUsername,
        lastSync: new Date(),
        cachedProfile: liveData.profile,
        cachedStats: liveData.stats,
        cachedActivity: liveData.submissionCalendar,
        cachedSubmissions: liveData.submissions,
      },
      { upsert: true, new: true }
    );

    return {
      connected: true,
      leetcodeUsername: user.leetcodeUsername,
      profile: liveData.profile,
      stats: liveData.stats,
      submissions: liveData.submissions,
      submissionCalendar: liveData.submissionCalendar,
    };
  }

  static async getProfile(userId, forceSync = false) {
    const user = await User.findById(userId);
    if (!user || !user.leetcodeUsername) {
      return {
        connected: false,
        profile: null,
        stats: null,
        submissions: [],
        submissionCalendar: {},
      };
    }

    if (!forceSync) {
      const cached = await LeetCodeData.findOne({ user: userId });
      if (cached && cached.cachedProfile && cached.cachedStats) {
        return {
          connected: true,
          leetcodeUsername: user.leetcodeUsername,
          profile: cached.cachedProfile,
          stats: cached.cachedStats,
          submissions: cached.cachedSubmissions || [],
          submissionCalendar: cached.cachedActivity || {},
        };
      }
    }

    return await this.syncUserLeetCode(userId);
  }

  static async getActivity(userId) {
    const data = await this.getProfile(userId);
    return {
      connected: data.connected,
      submissions: data.submissions || [],
      submissionCalendar: data.submissionCalendar || {},
    };
  }

  static async getStats(userId) {
    const data = await this.getProfile(userId);
    return {
      connected: data.connected,
      stats: data.stats || null,
    };
  }
}

module.exports = LeetCodeService;
