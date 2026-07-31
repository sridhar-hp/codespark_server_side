// src/models/Learning.js
const mongoose = require('mongoose');

const PLATFORMS = [
  'YouTube',
  'Coursera',
  'Udemy',
  'freeCodeCamp',
  'Documentation',
  'Book',
  'Other',
];

const CATEGORIES = [
  'MERN',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'AI',
  'TypeScript',
  'DSA',
  'English',
  'DevOps',
  'Other',
];

const STATUSES = ['Not Started', 'In Progress', 'Completed'];

const learningSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    platform: {
      type: String,
      enum: PLATFORMS,
      default: 'Other',
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
    },
    instructor: { type: String, trim: true, default: '' },
    thumbnail: { type: String, trim: true, default: '' },
    resourceUrl: { type: String, trim: true, default: '' },
    totalHours: { type: Number, default: 0, min: 0 },
    completedHours: { type: Number, default: 0, min: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Not Started',
    },
  },
  { timestamps: true }
);

// Pre-save hook to automatically keep userId synced and calculate progress/status if totalHours > 0
learningSchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }

  if (this.totalHours > 0) {
    this.progress = Math.min(100, Math.round((this.completedHours / this.totalHours) * 100));
  }

  if (this.progress >= 100 || (this.totalHours > 0 && this.completedHours >= this.totalHours)) {
    this.status = 'Completed';
  } else if (this.completedHours > 0 || this.progress > 0) {
    if (this.status === 'Not Started') {
      this.status = 'In Progress';
    }
  }
});

learningSchema.index({ user: 1 });
learningSchema.index({ userId: 1 });

module.exports = mongoose.model('Learning', learningSchema);
module.exports.PLATFORMS = PLATFORMS;
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
