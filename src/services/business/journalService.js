// src/services/business/journalService.js
const JournalEntry = require('../../models/JournalEntry');

class JournalService {
  static async create(userId, { title, content }) {
    return JournalEntry.create({ user: userId, title, content });
  }

  static async list(userId) {
    return JournalEntry.find({ user: userId }).sort({ createdAt: -1 });
  }

  static async get(entryId, userId) {
    const entry = await JournalEntry.findOne({ _id: entryId, user: userId });
    if (!entry) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }
    return entry;
  }

  static async update(entryId, userId, data) {
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: entryId, user: userId },
      data,
      { new: true, runValidators: true }
    );
    if (!entry) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }
    return entry;
  }

  static async delete(entryId, userId) {
    const entry = await JournalEntry.findOneAndDelete({
      _id: entryId,
      user: userId,
    });
    if (!entry) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }
    return entry;
  }
}

module.exports = JournalService;
