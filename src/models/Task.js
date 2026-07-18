// src/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    xpReward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
