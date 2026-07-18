// src/controllers/taskController.js
const TaskService = require('../services/business/taskService');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, res) => {
  try {
    const task = await TaskService.create(req.user.id, req.body);
    return success(res, task, 'Task created', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.list = async (req, res) => {
  try {
    const tasks = await TaskService.list(req.user.id);
    return success(res, tasks, 'Tasks retrieved');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.get = async (req, res) => {
  try {
    const task = await TaskService.get(req.params.id, req.user.id);
    return success(res, task, 'Task retrieved');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.update = async (req, res) => {
  try {
    const task = await TaskService.update(req.params.id, req.user.id, req.body);
    return success(res, task, 'Task updated');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.delete = async (req, res) => {
  try {
    await TaskService.delete(req.params.id, req.user.id);
    return success(res, null, 'Task deleted', 204);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.toggleComplete = async (req, res) => {
  try {
    const task = await TaskService.toggleComplete(req.params.id, req.user.id);
    return success(res, task, 'Task status toggled');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
