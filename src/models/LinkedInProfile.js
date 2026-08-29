// src/models/LinkedInProfile.js
const mongoose = require('mongoose');

const linkedInProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, default: 'Developer' },
    headline: { type: String, default: '' },
    role: { type: String, default: '' },
    quote: { type: String, default: '' },
    readiness: { type: Number, default: 75 },
    recruiterVisibility: { type: Number, default: 70 },
    profileStrength: { type: Number, default: 80 },
    goal: { type: String, default: '' },
    completenessItems: { type: Array, default: [] },
    profileSections: { type: Array, default: [] },
    featuredProjects: { type: Array, default: [] },
    profileMatrix: { type: Array, default: [] },
    networkStats: { type: Array, default: [] },
    careerRoadmap: { type: Array, default: [] },
    roadmapDetails: { type: Object, default: {} },
    activityTimeline: { type: Array, default: [] },
    recruiterInsights: { type: Array, default: [] },
    careerGoals: { type: Array, default: [] },
    careerAnalytics: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LinkedInProfile', linkedInProfileSchema);
