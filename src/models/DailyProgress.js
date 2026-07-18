// src/models/DailyProgress.js
const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    tasksCompleted: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dailyProgressSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
