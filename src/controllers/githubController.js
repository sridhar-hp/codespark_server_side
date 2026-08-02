// src/controllers/githubController.js
const GitHubService = require('../services/business/githubService');
const notificationService = require('../services/business/notificationService');
const activityService = require('../services/business/activityService');
const { success, error } = require('../utils/responseHandler');

const connectGithub = async (req, res) => {
  try {
    const { githubUsername } = req.body;
    const result = await GitHubService.connectUsername(req.user.id, githubUsername);

    await notificationService.createNotification(req.user.id, {
      title: 'GitHub Connected',
      message: `Your GitHub account "${githubUsername}" has been connected!`,
      type: 'GITHUB',
    });

    await activityService.createActivity(req.user.id, {
      activityType: 'GITHUB_CONNECTED',
      module: 'github',
      title: 'GitHub Connected',
      description: `Connected account "${githubUsername}"`,
      icon: 'Github',
      color: 'cyan',
    });

    return success(res, result, 'GitHub account connected successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getGithubProfile = async (req, res) => {
  try {
    const forceSync = req.query.forceSync === 'true';
    const data = await GitHubService.getProfileAndRepos(req.user.id, forceSync);
    return success(res, data, 'GitHub profile fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const syncGithub = async (req, res) => {
  try {
    const data = await GitHubService.syncUserGitHub(req.user.id);

    await notificationService.createNotification(req.user.id, {
      title: 'GitHub Sync Completed',
      message: 'Your GitHub profile and contribution data have been synchronized.',
      type: 'GITHUB',
    });

    await activityService.createActivity(req.user.id, {
      activityType: 'GITHUB_SYNCED',
      module: 'github',
      title: 'GitHub Synchronized',
      description: 'Latest repository & commit data synced',
      icon: 'GitPullRequest',
      color: 'cyan',
    });

    return success(res, data, 'GitHub profile synchronized');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  connectGithub,
  getGithubProfile,
  syncGithub,
  connect: connectGithub,
  getProfile: getGithubProfile,
  sync: syncGithub,
};
