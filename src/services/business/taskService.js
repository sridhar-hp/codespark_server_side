// src/services/business/taskService.js
const Task = require('../../models/Task');
const xpService = require('./xpService');

class TaskService {
  static async create(userId, data) {
    const task = await Task.create({ ...data, user: userId });
    return task;
  }

  static async list(userId) {
    return Task.find({ user: userId }).sort({ dueDate: 1 });
  }

  static async get(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    return task;
  }

  static async update(taskId, userId, updates) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    return task;
  }

  static async delete(taskId, userId) {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    // Remove XP if task had reward and was completed
    if (task.completed && task.xpReward) {
      await xpService.deductXP(userId, task.xpReward);
    }
    return task;
  }

  static async toggleComplete(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    task.completed = !task.completed;
    await task.save();

    if (task.completed && task.xpReward) {
      await xpService.addXP(userId, task.xpReward);
    }
    return task;
  }
}

module.exports = TaskService;
