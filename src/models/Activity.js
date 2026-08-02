// src/models/Activity.js
const mongoose = require('mongoose');

const MODULE_TYPES = [
  'tasks',
  'learning',
  'github',
  'xp',
  'achievements',
  'notifications',
  'leetcode',
  'linkedin',
  'communication',
  'system',
];

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activityType: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    module: {
      type: String,
      enum: MODULE_TYPES,
      required: true,
      default: 'system',
    },
    icon: { type: String, default: 'Zap' },
    color: { type: String, default: 'amber' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }
});

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ user: 1, module: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
module.exports.MODULE_TYPES = MODULE_TYPES;
