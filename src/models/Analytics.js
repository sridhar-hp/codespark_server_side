// src/models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalXP: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    achievementsEarned: { type: Number, default: 0 },
    // Additional aggregated fields can be added later.
  },
  { timestamps: true }
);

analyticsSchema.index({ user: 1, period: 1, startDate: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
