// src/controllers/journalController.js
const JournalService = require('../services/business/journalService');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, res) => {
  try {
    const entry = await JournalService.create(req.user.id, req.body);
    return success(res, entry, 'Journal entry created', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.list = async (req, res) => {
  try {
    const entries = await JournalService.list(req.user.id);
    return success(res, entries, 'Journal entries retrieved');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.update = async (req, res) => {
  try {
    const entry = await JournalService.update(
      req.params.id,
      req.user.id,
      req.body
    );
    return success(res, entry, 'Journal entry updated');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.delete = async (req, res) => {
  try {
    await JournalService.delete(req.params.id, req.user.id);
    return success(res, null, 'Journal entry deleted', 204);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
