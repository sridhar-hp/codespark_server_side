// src/models/Communication.js
const mongoose = require('mongoose');

const communicationActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, required: true }, // e.g., 'discord', 'slack'
    messageId: { type: String, required: true },
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

communicationActivitySchema.index({ user: 1, channel: 1, messageId: 1 }, { unique: true });

module.exports = mongoose.model('Communication', communicationActivitySchema);
