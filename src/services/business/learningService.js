// src/services/business/learningService.js
const Learning = require('../../models/Learning');
const activityService = require('./activityService');

class LearningService {
  /**
   * Create a new learning resource for the authenticated user.
   */
  static async createLearning(userId, data) {
    const learning = new Learning({
      ...data,
      user: userId,
      userId: userId,
    });
    await learning.save();

    await activityService.createActivity(userId, {
      activityType: 'LEARNING_CREATED',
      module: 'learning',
      title: 'Learning Path Created',
      description: learning.title,
      icon: 'BookOpen',
      color: 'amber',
    });

    return learning;
  }

  /**
   * View all learning resources owned by the authenticated user.
   */
  static async getLearningList(userId, filters = {}) {
    const query = {
      $or: [{ user: userId }, { userId: userId }],
    };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.platform) {
      query.platform = filters.platform;
    }
    if (filters.category) {
      query.category = filters.category;
    }

    return await Learning.find(query).sort({ updatedAt: -1 });
  }

  /**
   * View a single learning resource by ID owned by the authenticated user.
   */
  static async getLearningById(userId, learningId) {
    const learning = await Learning.findOne({
      _id: learningId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!learning) {
      const err = new Error('Learning resource not found');
      err.statusCode = 404;
      throw err;
    }

    return learning;
  }

  /**
   * Update a learning resource owned by the authenticated user.
   */
  static async updateLearning(userId, learningId, updateData) {
    const learning = await Learning.findOne({
      _id: learningId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!learning) {
      const err = new Error('Learning resource not found');
      err.statusCode = 404;
      throw err;
    }

    Object.assign(learning, updateData);
    await learning.save();

    await activityService.createActivity(userId, {
      activityType: 'LEARNING_UPDATED',
      module: 'learning',
      title: 'Learning Path Updated',
      description: learning.title,
      icon: 'BookOpen',
      color: 'amber',
    });

    return learning;
  }

  /**
   * Delete a learning resource owned by the authenticated user.
   */
  static async deleteLearning(userId, learningId) {
    const learning = await Learning.findOneAndDelete({
      _id: learningId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!learning) {
      const err = new Error('Learning resource not found');
      err.statusCode = 404;
      throw err;
    }

    return learning;
  }
}

module.exports = LearningService;
