// src/models/Journal.js
const mongoose = require('mongoose');

const MOOD_ENUM = [
  'Happy',
  'Focused',
  'Productive',
  'Neutral',
  'Tired',
  'Stressed',
  'Excited',
  'Sad',
];

const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    mood: {
      type: String,
      required: true,
      enum: MOOD_ENUM,
      default: 'Productive',
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

journalSchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }

  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).filter(Boolean).length;
  }
});

journalSchema.index({ user: 1, createdAt: -1 });
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ user: 1, isFavorite: 1 });
journalSchema.index({ user: 1, isPinned: 1 });
journalSchema.index({ user: 1, mood: 1 });
journalSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Journal', journalSchema);
module.exports.MOOD_ENUM = MOOD_ENUM;
