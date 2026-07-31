// src/models/LearningGoal.js
const mongoose = require('mongoose');

const GOAL_STATUSES = ['Not Started', 'In Progress', 'Completed'];

const learningGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    targetHours: { type: Number, required: true, min: [0.5, 'Target hours must be at least 0.5'] },
    completedHours: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: GOAL_STATUSES,
      default: 'Not Started',
    },
  },
  { timestamps: true }
);

learningGoalSchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }

  if (this.completedHours >= this.targetHours && this.targetHours > 0) {
    this.status = 'Completed';
  } else if (this.completedHours > 0) {
    if (this.status === 'Not Started') {
      this.status = 'In Progress';
    }
  }
});

learningGoalSchema.index({ user: 1, createdAt: -1 });
learningGoalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('LearningGoal', learningGoalSchema);
module.exports.GOAL_STATUSES = GOAL_STATUSES;
