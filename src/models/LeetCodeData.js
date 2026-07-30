// src/models/LeetCodeData.js
const mongoose = require('mongoose');

const leetcodeDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  leetcodeUsername: { type: String, default: '', trim: true },
  lastSync: { type: Date, default: null },
  cachedProfile: { type: Object, default: null },
  cachedStats: { type: Object, default: null },
  cachedActivity: { type: Object, default: null },
  cachedSubmissions: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('LeetCodeData', leetcodeDataSchema);
