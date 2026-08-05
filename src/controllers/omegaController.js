// src/controllers/omegaController.js
const OmegaService = require('../services/business/omegaService');
const { success, error } = require('../utils/responseHandler');

const getStatusCode = (err) => {
  if (err.statusCode) return err.statusCode;
  if (err.name === 'ValidationError' || err.name === 'CastError') return 400;
  return 500;
};

const startSession = async (req, res) => {
  try {
    const session = await OmegaService.startSession(req.user.id, req.body);
    return success(res, session, 'Omega session started', 201);
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const endSession = async (req, res) => {
  try {
    const session = await OmegaService.endSession(req.user.id, req.body);
    return success(res, session, 'Omega session ended & synced with CodeSpark ecosystem');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const addConversation = async (req, res) => {
  try {
    const session = await OmegaService.addConversation(req.user.id, req.body);
    return success(res, session, 'Conversation added to session');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await OmegaService.getStats(req.user.id);
    return success(res, stats, 'Omega statistics fetched successfully');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await OmegaService.getHistory(req.user.id, req.query.limit);
    return success(res, history, 'Omega history fetched successfully');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

module.exports = {
  startSession,
  endSession,
  addConversation,
  getStats,
  getHistory,
};
