// src/services/business/journalService.js
const Journal = require('../../models/Journal');
const xpService = require('./xpService');
const notificationService = require('./notificationService');
const activityService = require('./activityService');
const achievementService = require('./achievementService');

class JournalService {
  /**
   * Calculate consecutive days with journal entries for writing streak.
   */
  static async calculateStreak(userId) {
    const journals = await Journal.find({
      $or: [{ user: userId }, { userId: userId }],
    }).sort({ createdAt: -1 }).select('createdAt').lean();

    if (!journals || journals.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const uniqueDates = new Set();
    journals.forEach((j) => {
      if (j.createdAt) {
        uniqueDates.add(new Date(j.createdAt).toISOString().split('T')[0]);
      }
    });

    const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let checkDate = new Date(todayStr);
    if (!uniqueDates.has(todayStr) && uniqueDates.has(yesterdayStr)) {
      checkDate = new Date(yesterdayStr);
    }

    while (uniqueDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, longestStreak),
    };
  }

  /**
   * Create a new journal entry, award XP, update streaks, and trigger activities/notifications.
   */
  static async createJournal(userId, data) {
    const { title, content, mood = 'Productive', tags = [], isFavorite = false, isPinned = false } = data;

    const journal = new Journal({
      user: userId,
      userId: userId,
      title,
      content,
      mood,
      tags,
      isFavorite,
      isPinned,
    });

    await journal.save();

    // 1. Award XP: +20 XP for entry creation
    await xpService.addXP(userId, 20);

    // 2. Award +40 XP extra if 500+ words
    if (journal.wordCount >= 500) {
      await xpService.addXP(userId, 40);
    }

    // 3. Calculate writing streak and award streak XP / notifications
    const { currentStreak } = await this.calculateStreak(userId);
    if (currentStreak === 7) {
      await xpService.addXP(userId, 100);
      await notificationService.createNotification(userId, {
        title: '7-Day Writing Streak!',
        message: 'You achieved a 7-day journal writing streak! Keep reflecting daily!',
        type: 'STREAK',
      });
    } else if (currentStreak === 30) {
      await xpService.addXP(userId, 500);
      await notificationService.createNotification(userId, {
        title: '30-Day Writing Streak!',
        message: 'Legendary! 30 days of continuous journal reflections!',
        type: 'STREAK',
      });
    }

    // 4. Log Activity Timeline
    await activityService.createActivity(userId, {
      activityType: 'JOURNAL_CREATED',
      module: 'journal',
      title: 'Journal Entry Created',
      description: journal.title,
      icon: 'BookOpen',
      color: 'amber',
    });

    // 5. Create System Notification
    await notificationService.createNotification(userId, {
      title: 'Journal Entry Created',
      message: `Journal "${journal.title}" was successfully saved.`,
      type: 'SYSTEM',
      relatedEntity: journal._id,
      relatedEntityType: 'Journal',
    });

    // 6. Check and unlock achievements
    await achievementService.checkAndUnlock(userId);

    return journal;
  }

  /**
   * Update an existing journal entry.
   */
  static async updateJournal(userId, id, updateData) {
    const journal = await Journal.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!journal) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }

    if (updateData.title !== undefined) journal.title = updateData.title;
    if (updateData.content !== undefined) journal.content = updateData.content;
    if (updateData.mood !== undefined) journal.mood = updateData.mood;
    if (updateData.tags !== undefined) journal.tags = updateData.tags;
    if (updateData.isFavorite !== undefined) journal.isFavorite = updateData.isFavorite;
    if (updateData.isPinned !== undefined) journal.isPinned = updateData.isPinned;

    await journal.save();

    await activityService.createActivity(userId, {
      activityType: 'JOURNAL_UPDATED',
      module: 'journal',
      title: 'Journal Entry Updated',
      description: journal.title,
      icon: 'BookOpen',
      color: 'amber',
    });

    return journal;
  }

  /**
   * Delete a journal entry.
   */
  static async deleteJournal(userId, id) {
    const journal = await Journal.findOneAndDelete({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!journal) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }

    await activityService.createActivity(userId, {
      activityType: 'JOURNAL_DELETED',
      module: 'journal',
      title: 'Journal Entry Deleted',
      description: journal.title,
      icon: 'Trash2',
      color: 'red',
    });

    return journal;
  }

  /**
   * Toggle favorite status on a journal entry.
   */
  static async toggleFavorite(userId, id) {
    const journal = await Journal.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!journal) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }

    journal.isFavorite = !journal.isFavorite;
    await journal.save();

    await activityService.createActivity(userId, {
      activityType: 'JOURNAL_FAVORITED',
      module: 'journal',
      title: journal.isFavorite ? 'Journal Favorited' : 'Journal Unfavorited',
      description: journal.title,
      icon: 'Heart',
      color: 'red',
    });

    return journal;
  }

  /**
   * Toggle pin status on a journal entry.
   */
  static async togglePin(userId, id) {
    const journal = await Journal.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!journal) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }

    journal.isPinned = !journal.isPinned;
    await journal.save();

    await activityService.createActivity(userId, {
      activityType: 'JOURNAL_PINNED',
      module: 'journal',
      title: journal.isPinned ? 'Journal Pinned' : 'Journal Unpinned',
      description: journal.title,
      icon: 'Star',
      color: 'amber',
    });

    return journal;
  }

  /**
   * Get single journal entry by ID.
   */
  static async getJournalById(userId, id) {
    const journal = await Journal.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    }).lean();

    if (!journal) {
      const err = new Error('Journal entry not found');
      err.statusCode = 404;
      throw err;
    }

    return journal;
  }

  /**
   * Get list of journals for user with search, filtering, and sorting.
   */
  static async getJournals(userId, options = {}) {
    const query = {
      $or: [{ user: userId }, { userId: userId }],
    };

    // Filter by Search Query (title, content, tags)
    if (options.search && options.search.trim() !== '') {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex },
        ],
      });
    }

    // Filter by Mood
    if (options.mood && options.mood !== 'All') {
      query.mood = options.mood;
    }

    // Filter by Tag
    if (options.tag) {
      query.tags = options.tag;
    }

    // Filter by Favorite
    if (options.isFavorite === true || options.isFavorite === 'true') {
      query.isFavorite = true;
    }

    // Filter by Pinned
    if (options.isPinned === true || options.isPinned === 'true') {
      query.isPinned = true;
    }

    // Sort order
    let sortObj = { isPinned: -1, createdAt: -1 };
    if (options.sortBy === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (options.sortBy === 'title_asc') {
      sortObj = { title: 1 };
    } else if (options.sortBy === 'title_desc') {
      sortObj = { title: -1 };
    }

    const limit = Math.min(100, parseInt(options.limit, 10) || 100);

    const journals = await Journal.find(query)
      .sort(sortObj)
      .limit(limit)
      .lean();

    const count = await Journal.countDocuments(query);

    return {
      journals,
      count,
    };
  }

  /**
   * Get aggregated journal statistics.
   */
  static async getJournalStats(userId) {
    const filter = {
      $or: [{ user: userId }, { userId: userId }],
    };

    const totalJournals = await Journal.countDocuments(filter);
    const favoriteJournals = await Journal.countDocuments({ ...filter, isFavorite: true });
    const pinnedJournals = await Journal.countDocuments({ ...filter, isPinned: true });

    // Calculate most used mood
    const moodAggregation = await Journal.aggregate([
      { $match: { $or: [{ user: userId }, { userId: userId }] } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostUsedMood = moodAggregation.length > 0 ? moodAggregation[0]._id : 'Productive';

    // Calculate writing streak
    const { currentStreak: writingStreak } = await this.calculateStreak(userId);

    // Calculate average entries per week
    const oldestJournal = await Journal.findOne(filter).sort({ createdAt: 1 }).select('createdAt').lean();
    let avgEntriesPerWeek = totalJournals;
    if (oldestJournal) {
      const diffMs = Date.now() - new Date(oldestJournal.createdAt).getTime();
      const diffWeeks = Math.max(1, diffMs / (1000 * 60 * 60 * 24 * 7));
      avgEntriesPerWeek = Number((totalJournals / diffWeeks).toFixed(1));
    }

    const latestEntry = await Journal.findOne(filter).sort({ createdAt: -1 }).lean();

    return {
      totalJournals,
      favoriteJournals,
      pinnedJournals,
      mostUsedMood,
      writingStreak,
      avgEntriesPerWeek,
      latestEntry,
    };
  }
}

module.exports = JournalService;
