// src/controllers/journalController.js
const JournalService = require('../services/business/journalService');
const { success, error } = require('../utils/responseHandler');

const createJournal = async (req, res) => {
  try {
    const journal = await JournalService.createJournal(req.user.id, req.body);
    return success(res, journal, 'Journal entry created successfully', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getJournals = async (req, res) => {
  try {
    const { search, mood, tag, isFavorite, isPinned, sortBy, limit } = req.query;
    const result = await JournalService.getJournals(req.user.id, {
      search,
      mood,
      tag,
      isFavorite,
      isPinned,
      sortBy,
      limit,
    });
    return success(res, result, 'Journals retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getJournalStats = async (req, res) => {
  try {
    const stats = await JournalService.getJournalStats(req.user.id);
    return success(res, stats, 'Journal stats retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getJournalById = async (req, res) => {
  try {
    const journal = await JournalService.getJournalById(req.user.id, req.params.id);
    return success(res, journal, 'Journal entry retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const updateJournal = async (req, res) => {
  try {
    const journal = await JournalService.updateJournal(req.user.id, req.params.id, req.body);
    return success(res, journal, 'Journal entry updated successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const deleteJournal = async (req, res) => {
  try {
    const journal = await JournalService.deleteJournal(req.user.id, req.params.id);
    return success(res, journal, 'Journal entry deleted successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const journal = await JournalService.toggleFavorite(req.user.id, req.params.id);
    return success(res, journal, 'Journal favorite status toggled');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const togglePin = async (req, res) => {
  try {
    const journal = await JournalService.togglePin(req.user.id, req.params.id);
    return success(res, journal, 'Journal pin status toggled');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  createJournal,
  getJournals,
  getJournalStats,
  getJournalById,
  updateJournal,
  deleteJournal,
  toggleFavorite,
  togglePin,
};
