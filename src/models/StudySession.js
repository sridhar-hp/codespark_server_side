// src/models/StudySession.js
const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    learningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Learning',
      required: true,
    },
    studyDate: { type: Date, default: Date.now, required: true },
    durationMinutes: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute'],
      max: [720, 'Duration cannot exceed 720 minutes (12 hours)'],
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Pre-save hook to synchronize user and userId
studySessionSchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }
});

studySessionSchema.index({ user: 1, studyDate: -1 });
studySessionSchema.index({ userId: 1, studyDate: -1 });
studySessionSchema.index({ learningId: 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
