// src/controllers/githubController.js
const GitHubService = require('../services/business/githubService');
const { success, error } = require('../utils/responseHandler');

exports.connect = async (req, res) => {
  try {
    const { githubUsername } = req.body;
    const result = await GitHubService.connectUsername(req.user.id, githubUsername);
    return success(res, result, 'GitHub account connected successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const data = await GitHubService.getProfileAndRepos(req.user.id);
    return success(res, data, 'GitHub profile fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
