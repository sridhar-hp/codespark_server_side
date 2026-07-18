// src/models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  points: { type: Number, required: true, min: 0 },
  icon: { type: String }, // URL to icon image
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
