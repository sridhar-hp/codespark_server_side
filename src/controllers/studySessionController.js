// src/controllers/studySessionController.js
const StudySessionService = require('../services/business/studySessionService');
const { success, error } = require('../utils/responseHandler');

/**
 * Create a new Study Session
 */
const createStudySession = async (req, res) => {
  try {
    const session = await StudySessionService.createStudySession(
      req.user.id,
      req.body
    );
    return success(res, session, 'Study session created successfully', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Get all Study Sessions for the authenticated user
 */
const getStudySessions = async (req, res) => {
  try {
    const sessions = await StudySessionService.getStudySessions(
      req.user.id,
      req.query
    );
    return success(res, sessions, 'Study sessions retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Get a single Study Session by ID for the authenticated user
 */
const getStudySession = async (req, res) => {
  try {
    const session = await StudySessionService.getStudySession(
      req.user.id,
      req.params.id
    );
    return success(res, session, 'Study session retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Update a Study Session by ID for the authenticated user
 */
const updateStudySession = async (req, res) => {
  try {
    const session = await StudySessionService.updateStudySession(
      req.user.id,
      req.params.id,
      req.body
    );
    return success(res, session, 'Study session updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

/**
 * Delete a Study Session by ID for the authenticated user
 */
const deleteStudySession = async (req, res) => {
  try {
    const session = await StudySessionService.deleteStudySession(
      req.user.id,
      req.params.id
    );
    return success(res, session, 'Study session deleted successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  createStudySession,
  getStudySessions,
  getStudySession,
  updateStudySession,
  deleteStudySession,
  // Aliases for compatibility
  create: createStudySession,
  list: getStudySessions,
  getById: getStudySession,
  update: updateStudySession,
  delete: deleteStudySession,
};
