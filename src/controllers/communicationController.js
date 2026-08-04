// src/controllers/communicationController.js
const CommunicationService = require('../services/business/communicationService');
const { success, error } = require('../utils/responseHandler');

const getStatusCode = (err) => {
  if (err.statusCode) return err.statusCode;
  if (err.name === 'ValidationError' || err.name === 'CastError') return 400;
  return 500;
};

const createCommunication = async (req, res) => {
  try {
    const comm = await CommunicationService.createCommunication(req.user.id, req.body);
    return success(res, comm, 'Communication activity created successfully', 201);
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const getCommunications = async (req, res) => {
  try {
    const {
      search,
      communicationType,
      status,
      priority,
      platform,
      timeframe,
      sortBy,
      limit,
    } = req.query;

    const result = await CommunicationService.getCommunications(req.user.id, {
      search,
      communicationType,
      status,
      priority,
      platform,
      timeframe,
      sortBy,
      limit,
    });
    return success(res, result, 'Communications fetched successfully');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const getCommunicationStats = async (req, res) => {
  try {
    const stats = await CommunicationService.getCommunicationStats(req.user.id);
    return success(res, stats, 'Communication statistics fetched successfully');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const getCommunicationById = async (req, res) => {
  try {
    const comm = await CommunicationService.getCommunicationById(req.user.id, req.params.id);
    return success(res, comm, 'Communication activity fetched successfully');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const updateCommunication = async (req, res) => {
  try {
    const comm = await CommunicationService.updateCommunication(req.user.id, req.params.id, req.body);
    return success(res, comm, 'Communication activity updated successfully');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const deleteCommunication = async (req, res) => {
  try {
    const comm = await CommunicationService.deleteCommunication(req.user.id, req.params.id);
    return success(res, comm, 'Communication activity deleted successfully');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const markCompleted = async (req, res) => {
  try {
    const comm = await CommunicationService.markCompleted(req.user.id, req.params.id);
    return success(res, comm, 'Communication marked as completed');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

const markMissed = async (req, res) => {
  try {
    const comm = await CommunicationService.markMissed(req.user.id, req.params.id);
    return success(res, comm, 'Communication marked as missed');
  } catch (err) {
    return error(res, err, getStatusCode(err));
  }
};

module.exports = {
  createCommunication,
  getCommunications,
  getCommunicationStats,
  getCommunicationById,
  updateCommunication,
  deleteCommunication,
  markCompleted,
  markMissed,
};
