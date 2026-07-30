// src/controllers/githubController.js
const GitHubService = require('../services/business/githubService');
const { success, error } = require('../utils/responseHandler');

const connectGithub = async (req, res) => {
  try {
    const { githubUsername } = req.body;
    const result = await GitHubService.connectUsername(req.user.id, githubUsername);
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
