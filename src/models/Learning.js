// src/models/Learning.js
const mongoose = require('mongoose');

const learningActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resourceUrl: { type: String, required: true },
    title: { type: String, required: true },
    durationMinutes: { type: Number },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

learningActivitySchema.index({ user: 1, resourceUrl: 1 });

module.exports = mongoose.model('Learning', learningActivitySchema);
