// src/services/business/activityService.js
// Provides generic CRUD for activity collections.

const models = {
  github: require('../../models/Github'),
  leetcode: require('../../models/Leetcode'),
  learning: require('../../models/Learning'),
  communication: require('../../models/Communication'),
  linkedin: require('../../models/LinkedIn'),
};

class ActivityService {
  static async create(type, userId, payload) {
    const Model = models[type];
    if (!Model) {
      const err = new Error('Invalid activity type');
      err.statusCode = 400;
      throw err;
    }
    return Model.create({ user: userId, ...payload });
  }

  static async list(type, userId) {
    const Model = models[type];
    if (!Model) {
      const err = new Error('Invalid activity type');
      err.statusCode = 400;
      throw err;
    }
    return Model.find({ user: userId }).sort({ createdAt: -1 });
  }

  static async delete(type, activityId, userId) {
    const Model = models[type];
    if (!Model) {
      const err = new Error('Invalid activity type');
      err.statusCode = 400;
      throw err;
    }
    const doc = await Model.findOneAndDelete({
      _id: activityId,
      user: userId,
    });
    if (!doc) {
      const err = new Error('Activity not found');
      err.statusCode = 404;
      throw err;
    }
    return doc;
  }
}

module.exports = ActivityService;
