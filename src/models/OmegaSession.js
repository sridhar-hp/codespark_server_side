// src/models/OmegaSession.js
const mongoose = require('mongoose');

const STATUS_ENUM = ['Active', 'Completed', 'Interrupted'];

const omegaSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, required: true, unique: true, index: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds
    durationMinutes: { type: Number, default: 0 }, // in minutes
    platform: { type: String, default: 'OmegaTV' },
    status: { type: String, enum: STATUS_ENUM, default: 'Active' },
    conversationCount: { type: Number, default: 0 },
    talkTime: { type: Number, default: 0 }, // in seconds
    idleTime: { type: Number, default: 0 }, // in seconds
    date: { type: String, required: true }, // YYYY-MM-DD for heatmap and daily progress
  },
  { timestamps: true }
);

omegaSessionSchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }

  if (this.duration && (!this.durationMinutes || this.durationMinutes === 0)) {
    this.durationMinutes = Math.max(1, Math.round(this.duration / 60));
  }

  if (!this.date) {
    this.date = new Date(this.startTime || Date.now()).toISOString().split('T')[0];
  }
});

omegaSessionSchema.index({ user: 1, startTime: -1 });
omegaSessionSchema.index({ userId: 1, startTime: -1 });
omegaSessionSchema.index({ user: 1, status: 1 });
omegaSessionSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('OmegaSession', omegaSessionSchema);
module.exports.STATUS_ENUM = STATUS_ENUM;
