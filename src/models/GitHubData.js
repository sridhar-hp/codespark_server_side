// src/models/GitHubData.js
const mongoose = require('mongoose');

const githubDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  githubUsername: { type: String, default: '', trim: true },
  lastSync: { type: Date, default: null },
  cachedProfile: { type: Object, default: null },
  cachedRepositories: { type: Array, default: [] },
  cachedContributionData: { type: Object, default: null },
  lastCalculatedMetrics: { type: Object, default: null },
}, { timestamps: true });

module.exports = mongoose.model('GitHubData', githubDataSchema);
