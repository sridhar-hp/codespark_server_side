// src/services/business/learningGoalService.js
const LearningGoal = require('../../models/LearningGoal');
const xpService = require('./xpService');

class LearningGoalService {
  /**
   * Create a new learning goal for the authenticated user.
   */
  static async createGoal(userId, data) {
    const goal = new LearningGoal({
      ...data,
      user: userId,
      userId: userId,
    });
    await goal.save();

    // Award +150 XP if completed
    if (goal.status === 'Completed' || goal.completedHours >= goal.targetHours) {
      await xpService.addXP(userId, 150);
    }

    return this.formatGoalResponse(goal);
  }

  /**
   * Get all learning goals for the authenticated user.
   */
  static async getGoals(userId) {
    const goals = await LearningGoal.find({
      $or: [{ user: userId }, { userId: userId }],
    }).sort({ createdAt: -1 });

    return goals.map((g) => this.formatGoalResponse(g));
  }

  /**
   * Get a single learning goal by ID.
   */
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

  /**
   * Update a learning goal for the authenticated user.
   */
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

    // Award +150 XP when newly completed
    if (!wasCompleted && (goal.status === 'Completed' || goal.completedHours >= goal.targetHours)) {
      await xpService.addXP(userId, 150);
    }

    return this.formatGoalResponse(goal);
  }

  /**
   * Delete a learning goal.
   */
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

  /**
   * Helper to append goal Completion Percentage
   */
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
