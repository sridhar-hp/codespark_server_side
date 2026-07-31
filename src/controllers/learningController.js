// src/controllers/learningController.js
const LearningService = require('../services/business/learningService');
const { success, error } = require('../utils/responseHandler');

/**
 * Create a new learning resource
 */
const createLearning = async (req, res) => {
  try {
    const learning = await LearningService.createLearning(req.user.id, req.body);
    return success(res, learning, 'Learning resource created successfully', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Get all learning resources for the authenticated user
 */
const getLearningList = async (req, res) => {
  try {
    const learningList = await LearningService.getLearningList(req.user.id, req.query);
    return success(res, learningList, 'Learning resources retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Get a single learning resource by ID for the authenticated user
 */
const getLearning = async (req, res) => {
  try {
    const learning = await LearningService.getLearningById(req.user.id, req.params.id);
    return success(res, learning, 'Learning resource retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Update a learning resource for the authenticated user
 */
const updateLearning = async (req, res) => {
  try {
    const learning = await LearningService.updateLearning(req.user.id, req.params.id, req.body);
    return success(res, learning, 'Learning resource updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Delete a learning resource for the authenticated user
 */
const deleteLearning = async (req, res) => {
  try {
    const learning = await LearningService.deleteLearning(req.user.id, req.params.id);
    return success(res, learning, 'Learning resource deleted successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  createLearning,
  getLearningList,
  getLearning,
  updateLearning,
  deleteLearning,
  // Aliases for compatibility
  create: createLearning,
  list: getLearningList,
  getById: getLearning,
  update: updateLearning,
  delete: deleteLearning,
};
