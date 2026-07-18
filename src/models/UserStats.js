// src/models/UserStats.js
const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    achievementsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserStats', userStatsSchema);
