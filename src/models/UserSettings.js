// src/models/UserSettings.js
const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['Dark', 'Light', 'System'], default: 'Dark' },
    accent: { type: String, default: 'Amber' },
    density: { type: String, enum: ['Comfortable', 'Compact'], default: 'Comfortable' },
    sidebar: { type: String, enum: ['Expanded', 'Collapsed', 'Floating'], default: 'Expanded' },
    borderRadius: { type: String, enum: ['Rounded', 'Medium', 'Sharp'], default: 'Medium' },
    animation: { type: String, enum: ['Fast', 'Normal', 'Reduced Motion'], default: 'Normal' },
    language: { type: String, default: 'English (US)' },
    timezone: { type: String, default: 'UTC-08:00 Pacific Time' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    autoSave: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    notificationSettings: {
      taskNotifications: { type: Boolean, default: true },
      learningNotifications: { type: Boolean, default: true },
      xpNotifications: { type: Boolean, default: true },
      achievementNotifications: { type: Boolean, default: true },
      githubNotifications: { type: Boolean, default: true },
      systemNotifications: { type: Boolean, default: true },
    },
    privacySettings: {
      profileVisibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
      showGithubPublicly: { type: Boolean, default: true },
      showLearningStats: { type: Boolean, default: true },
      showAchievementStats: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);
