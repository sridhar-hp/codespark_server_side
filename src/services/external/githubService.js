// src/services/external/githubService.js
const axios = require('axios');

class GitHubService {
  static async fetchUserRepos(username) {
    const url = `https://api.github.com/users/${username}/repos`;
    const response = await axios.get(url);
    return response.data;
  }

  // Additional methods (e.g., fetch commits) can be added as needed.
}

module.exports = GitHubService;
