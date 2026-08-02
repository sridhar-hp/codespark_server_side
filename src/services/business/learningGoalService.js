// src/services/business/learningGoalService.js
const LearningGoal = require('../../models/LearningGoal');
const xpService = require('./xpService');
const notificationService = require('./notificationService');

class LearningGoalService {
  static async createGoal(userId, data) {
    const goal = new LearningGoal({
      ...data,
      user: userId,
      userId: userId,
    });
    await goal.save();

    if (goal.status === 'Completed' || goal.completedHours >= goal.targetHours) {
      await xpService.addXP(userId, 150);
      await notificationService.createNotification(userId, {
        title: 'Goal Achieved!',
        message: `You completed your learning goal "${goal.title}"!`,
        type: 'GOAL',
        relatedEntity: goal._id,
        relatedEntityType: 'LearningGoal',
      });
    }

    return this.formatGoalResponse(goal);
  }

  static async getGoals(userId) {
    const goals = await LearningGoal.find({
      $or: [{ user: userId }, { userId: userId }],
    }).sort({ createdAt: -1 });

    return goals.map((g) => this.formatGoalResponse(g));
  }

  static async getGoalById(userId, goalId) {
    const goal = await LearningGoal.findOne({
      _id: goalId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!goal) {
      const err = new Error('Learning goal not found');
      err.statusCode = 404;
      throw err;
    }

    return this.formatGoalResponse(goal);
  }

  static async updateGoal(userId, goalId, updateData) {
    const goal = await LearningGoal.findOne({
      _id: goalId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!goal) {
      const err = new Error('Learning goal not found');
      err.statusCode = 404;
      throw err;
    }

    const wasCompleted = goal.status === 'Completed';

    Object.assign(goal, updateData);
    await goal.save();

    if (!wasCompleted && (goal.status === 'Completed' || goal.completedHours >= goal.targetHours)) {
      await xpService.addXP(userId, 150);
      await notificationService.createNotification(userId, {
        title: 'Goal Achieved!',
        message: `You completed your learning goal "${goal.title}"!`,
        type: 'GOAL',
        relatedEntity: goal._id,
        relatedEntityType: 'LearningGoal',
      });
    }

    return this.formatGoalResponse(goal);
  }

  static async deleteGoal(userId, goalId) {
    const goal = await LearningGoal.findOneAndDelete({
      _id: goalId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!goal) {
      const err = new Error('Learning goal not found');
      err.statusCode = 404;
      throw err;
    }

    return goal;
  }

  static formatGoalResponse(goal) {
    const doc = goal.toObject ? goal.toObject() : { ...goal };
    const completionPercentage = doc.targetHours > 0
      ? Math.min(100, Math.round((doc.completedHours / doc.targetHours) * 100))
      : 0;

    return {
      ...doc,
      completionPercentage,
    };
  }
}

module.exports = LearningGoalService;
