// src/models/Github.js
const mongoose = require('mongoose');

const githubActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    repo: { type: String, required: true },
    action: { type: String, required: true }, // e.g., 'push', 'star', 'fork'
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

githubActivitySchema.index({ user: 1, repo: 1, timestamp: -1 });

module.exports = mongoose.model('Github', githubActivitySchema);
