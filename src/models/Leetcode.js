// src/models/Leetcode.js
const mongoose = require('mongoose');

const leetcodeActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemSlug: { type: String, required: true },
    status: { type: String, enum: ['accepted', 'failed'], required: true },
    language: { type: String },
    difficulty: { type: String },
    solvedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leetcodeActivitySchema.index({ user: 1, problemSlug: 1 }, { unique: true });

module.exports = mongoose.model('Leetcode', leetcodeActivitySchema);
