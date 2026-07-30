// src/services/external/githubRestService.js

class GitHubRestService {
  static getHeaders() {
    const headers = {
      'User-Agent': 'CodeSpark-App',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
  }

  static async fetchProfile(username) {
    const cleanUsername = encodeURIComponent(username.trim());
    const res = await fetch(`https://api.github.com/users/${cleanUsername}`, {
      headers: this.getHeaders(),
    });

    if (res.status === 404) {
      const err = new Error(`GitHub user '${username}' not found`);
      err.statusCode = 404;
      throw err;
    }

    if (res.status === 403) {
      const err = new Error('GitHub API rate limit exceeded. Please try again later.');
      err.statusCode = 403;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(`GitHub REST API error (${res.status}): ${res.statusText}`);
      err.statusCode = res.status;
      throw err;
    }

    const data = await res.json();
    return {
      username: data.login,
      name: data.name || data.login,
      avatarUrl: data.avatar_url,
      bio: data.bio || 'No bio provided.',
      followers: data.followers || 0,
      following: data.following || 0,
      publicRepos: data.public_repos || 0,
      createdAt: data.created_at,
      htmlUrl: data.html_url,
      company: data.company || 'CodeSpark Workspace',
      location: data.location || 'San Francisco, CA',
      blog: data.blog || `github.com/${data.login}`,
    };
  }

  static async fetchRepositories(username) {
    const cleanUsername = encodeURIComponent(username.trim());
    const res = await fetch(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=30`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      return [];
    }

    const repos = await res.json();
    if (!Array.isArray(repos)) return [];

    return repos.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || 'No description provided.',
      htmlUrl: r.html_url,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      openIssues: r.open_issues_count || 0,
      language: r.language || 'JavaScript',
      visibility: r.private ? 'Private' : r.archived ? 'Archived' : 'Public',
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at || r.updated_at,
      size: r.size || 0,
    }));
  }
}

module.exports = GitHubRestService;
