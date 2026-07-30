// src/services/business/githubService.js
const User = require('../../models/User');

class GitHubService {
  static async connectUsername(userId, username) {
    if (!username || typeof username !== 'string' || !username.trim()) {
      const err = new Error('GitHub username is required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.trim();

    // Validate username via GitHub REST API
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers: {
        'User-Agent': 'CodeSpark-App',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (userRes.status === 404) {
      const err = new Error(`GitHub user '${cleanUsername}' not found`);
      err.statusCode = 404;
      throw err;
    }

    if (!userRes.ok) {
      const err = new Error(`GitHub API error (${userRes.status}): ${userRes.statusText}`);
      err.statusCode = userRes.status;
      throw err;
    }

    const profileData = await userRes.json();

    const user = await User.findByIdAndUpdate(
      userId,
      { githubUsername: profileData.login },
      { new: true }
    );

    return {
      connected: true,
      githubUsername: user ? user.githubUsername : profileData.login,
    };
  }

  static async getProfileAndRepos(userId) {
    const user = await User.findById(userId);
    if (!user || !user.githubUsername) {
      return {
        connected: false,
        profile: null,
        repos: [],
      };
    }

    const username = user.githubUsername;

    const profileRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'CodeSpark-App',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (profileRes.status === 404) {
      return {
        connected: false,
        profile: null,
        repos: [],
        error: `GitHub user '${username}' not found`,
      };
    }

    if (!profileRes.ok) {
      const err = new Error(`GitHub API error (${profileRes.status})`);
      err.statusCode = profileRes.status;
      throw err;
    }

    const profile = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5`, {
      headers: {
        'User-Agent': 'CodeSpark-App',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let repos = [];
    if (reposRes.ok) {
      const rawRepos = await reposRes.json();
      repos = rawRepos.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || 'No description provided.',
        htmlUrl: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || 'Plain Text',
        updatedAt: r.updated_at,
      }));
    }

    return {
      connected: true,
      profile: {
        username: profile.login,
        name: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
        bio: profile.bio || 'No bio provided.',
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        createdAt: profile.created_at,
        htmlUrl: profile.html_url,
      },
      repos,
    };
  }
}

module.exports = GitHubService;
