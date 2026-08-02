// src/models/Notification.js
const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'TASK',
  'LEARNING',
  'GOAL',
  'XP',
  'ACHIEVEMENT',
  'STREAK',
  'SYSTEM',
  'GITHUB',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      default: 'SYSTEM',
    },
    relatedEntity: { type: mongoose.Schema.Types.ObjectId, default: null },
    relatedEntityType: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save hook to synchronize fields
notificationSchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }

  if (this.isModified('isRead')) {
    this.read = this.isRead;
  } else if (this.isModified('read')) {
    this.isRead = this.read;
  }
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
