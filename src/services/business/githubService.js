// src/services/business/githubService.js
const User = require('../../models/User');
const GitHubData = require('../../models/GitHubData');
const GitHubRestService = require('../external/githubRestService');
const GitHubGraphqlService = require('../external/githubGraphqlService');
const GitHubCalculationService = require('./githubCalculationService');

class GitHubService {
  static async connectUsername(userId, username) {
    if (!username || typeof username !== 'string' || !username.trim()) {
      const err = new Error('GitHub username is required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.trim();

    // 1. Fetch REST Profile to validate username
    const profile = await GitHubRestService.fetchProfile(cleanUsername);

    // 2. Save username in User model
    await User.findByIdAndUpdate(userId, { githubUsername: profile.username }, { new: true });

    // 3. Trigger full sync to populate cache & calculated metrics
    return await this.syncUserGitHub(userId, profile.username);
  }

  static async syncUserGitHub(userId, usernameOverride = null) {
    const user = await User.findById(userId);
    const username = usernameOverride || (user ? user.githubUsername : null);

    if (!username) {
      return {
        connected: false,
        profile: null,
        repos: [],
        contributions: null,
        analytics: null,
      };
    }

    // 1. Fetch live REST Profile & Repositories
    const profile = await GitHubRestService.fetchProfile(username);
    const repos = await GitHubRestService.fetchRepositories(username);

    // 2. Fetch GraphQL Contribution Calendar
    const calendarData = await GitHubGraphqlService.fetchContributionCalendar(username, repos);

    // 3. Calculate all metrics inside CodeSpark
    const analytics = GitHubCalculationService.calculateAll(profile, repos, calendarData);

    // 4. Save cache to MongoDB GitHubData collection
    await GitHubData.findOneAndUpdate(
      { user: userId },
      {
        githubUsername: profile.username,
        lastSync: new Date(),
        cachedProfile: profile,
        cachedRepositories: analytics.repos,
        cachedContributionData: calendarData,
        lastCalculatedMetrics: analytics,
      },
      { upsert: true, new: true }
    );

    return {
      connected: true,
      profile,
      repos: analytics.repos,
      contributions: calendarData,
      analytics,
    };
  }

  static async getProfileAndRepos(userId, forceSync = false) {
    const user = await User.findById(userId);
    if (!user || !user.githubUsername) {
      return {
        connected: false,
        profile: null,
        repos: [],
        contributions: null,
        analytics: null,
      };
    }

    // Check cached data in MongoDB
    if (!forceSync) {
      const cached = await GitHubData.findOne({ user: userId });
      if (cached && cached.cachedProfile && cached.lastCalculatedMetrics) {
        return {
          connected: true,
          profile: cached.cachedProfile,
          repos: cached.lastCalculatedMetrics.repos || cached.cachedRepositories || [],
          contributions: cached.cachedContributionData || null,
          analytics: cached.lastCalculatedMetrics,
        };
      }
    }

    // Cache miss or forceSync requested -> sync live GitHub data
    return await this.syncUserGitHub(userId, user.githubUsername);
  }
}

module.exports = GitHubService;
