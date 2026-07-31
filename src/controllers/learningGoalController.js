// src/controllers/learningGoalController.js
const LearningGoalService = require('../services/business/learningGoalService');
const { success, error } = require('../utils/responseHandler');

const createGoal = async (req, res) => {
  try {
    const goal = await LearningGoalService.createGoal(req.user.id, req.body);
    return success(res, goal, 'Learning goal created successfully', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await LearningGoalService.getGoals(req.user.id);
    return success(res, goals, 'Learning goals retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getGoal = async (req, res) => {
  try {
    const goal = await LearningGoalService.getGoalById(req.user.id, req.params.id);
    return success(res, goal, 'Learning goal retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await LearningGoalService.updateGoal(req.user.id, req.params.id, req.body);
    return success(res, goal, 'Learning goal updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await LearningGoalService.deleteGoal(req.user.id, req.params.id);
    return success(res, goal, 'Learning goal deleted successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  create: createGoal,
  list: getGoals,
  getById: getGoal,
  update: updateGoal,
  delete: deleteGoal,
};
