// src/models/LinkedIn.js
const mongoose = require('mongoose');

const linkedInActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, required: true }, // e.g., 'post', 'connection'
    payload: { type: mongoose.Schema.Types.Mixed },
    activityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

linkedInActivitySchema.index({ user: 1, activityType: 1, activityAt: -1 });

module.exports = mongoose.model('LinkedIn', linkedInActivitySchema);
