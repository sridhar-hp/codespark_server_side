// src/services/business/studySessionService.js
const StudySession = require('../../models/StudySession');
const Learning = require('../../models/Learning');
const xpService = require('./xpService');

class StudySessionService {
  /**
   * Helper method to recalculate and save Learning course progress and status.
   */
  static async updateLearningProgress(learning) {
    if (!learning) return;

    if (learning.totalHours > 0) {
      if (learning.completedHours > learning.totalHours) {
        learning.completedHours = learning.totalHours;
      }
      learning.progress = Math.min(
        100,
        Math.round((learning.completedHours / learning.totalHours) * 100)
      );
    }

    if (
      learning.progress >= 100 ||
      (learning.totalHours > 0 && learning.completedHours >= learning.totalHours)
    ) {
      learning.status = 'Completed';
    } else if (learning.completedHours > 0 || learning.progress > 0) {
      if (learning.status === 'Not Started') {
        learning.status = 'In Progress';
      }
    }

    await learning.save();
  }

  /**
   * Calculate consecutive active study streak days.
   */
  static async calculateStreak(userId) {
    const sessions = await StudySession.find({
      $or: [{ user: userId }, { userId: userId }],
    }).sort({ studyDate: -1 });

    if (!sessions || sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const uniqueDates = new Set();
    sessions.forEach((s) => {
      if (s.studyDate) {
        uniqueDates.add(new Date(s.studyDate).toISOString().split('T')[0]);
      }
    });

    const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Current streak
    let checkDate = new Date(todayStr);
    if (!uniqueDates.has(todayStr) && uniqueDates.has(yesterdayStr)) {
      checkDate = new Date(yesterdayStr);
    }

    while (uniqueDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Longest streak
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
   * Create a new Study Session, update course progress, and trigger XP rules.
   */
  static async createStudySession(userId, data) {
    const { learningId, durationMinutes, studyDate, notes } = data;

    // 1. Verify Learning resource exists and belongs to current user
    const learning = await Learning.findOne({
      _id: learningId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!learning) {
      const err = new Error('Learning resource not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }

    const wasCompleted = learning.status === 'Completed';

    // 2. Create and save StudySession
    const session = new StudySession({
      user: userId,
      userId: userId,
      learningId,
      durationMinutes,
      studyDate: studyDate || new Date(),
      notes: notes || '',
    });
    await session.save();

    // 3. Automatically update Learning completedHours
    const addedHours = durationMinutes / 60;
    learning.completedHours = (learning.completedHours || 0) + addedHours;
    await this.updateLearningProgress(learning);

    // 4. XP Integration Rules
    // Rule A: Study Session duration XP (30m -> 20 XP, 60m -> 40 XP)
    const sessionXP = Math.max(10, Math.round(durationMinutes * (40 / 60)));
    await xpService.addXP(userId, sessionXP);

    // Rule B: Complete Course (+100 XP)
    if (!wasCompleted && learning.status === 'Completed') {
      await xpService.addXP(userId, 100);
    }

    // Rule C: Streak Milestones (7 days -> 50 XP, 30 days -> 250 XP)
    const { currentStreak } = await this.calculateStreak(userId);
    if (currentStreak === 7) {
      await xpService.addXP(userId, 50);
    } else if (currentStreak === 30) {
      await xpService.addXP(userId, 250);
    }

    return await StudySession.findById(session._id).populate('learningId');
  }

  /**
   * Get all study sessions for the authenticated user.
   */
  static async getStudySessions(userId, filters = {}) {
    const query = {
      $or: [{ user: userId }, { userId: userId }],
    };

    if (filters.learningId) {
      query.learningId = filters.learningId;
    }

    return await StudySession.find(query)
      .populate('learningId')
      .sort({ studyDate: -1, createdAt: -1 });
  }

  /**
   * Get a single study session by ID for the authenticated user.
   */
  static async getStudySession(userId, sessionId) {
    const session = await StudySession.findOne({
      _id: sessionId,
      $or: [{ user: userId }, { userId: userId }],
    }).populate('learningId');

    if (!session) {
      const err = new Error('Study Session not found');
      err.statusCode = 404;
      throw err;
    }

    return session;
  }

  /**
   * Update a study session for the authenticated user and adjust course progress if duration changes.
   */
  static async updateStudySession(userId, sessionId, updateData) {
    const session = await StudySession.findOne({
      _id: sessionId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!session) {
      const err = new Error('Study Session not found');
      err.statusCode = 404;
      throw err;
    }

    const oldDuration = session.durationMinutes;
    const oldLearningId = session.learningId;

    if (updateData.durationMinutes !== undefined) {
      session.durationMinutes = updateData.durationMinutes;
    }
    if (updateData.studyDate !== undefined) {
      session.studyDate = updateData.studyDate;
    }
    if (updateData.notes !== undefined) {
      session.notes = updateData.notes;
    }

    await session.save();

    if (
      updateData.durationMinutes !== undefined &&
      updateData.durationMinutes !== oldDuration
    ) {
      const learning = await Learning.findOne({
        _id: oldLearningId,
        $or: [{ user: userId }, { userId: userId }],
      });

      if (learning) {
        const diffHours = (updateData.durationMinutes - oldDuration) / 60;
        learning.completedHours = Math.max(0, (learning.completedHours || 0) + diffHours);
        await this.updateLearningProgress(learning);
      }
    }

    return await StudySession.findById(session._id).populate('learningId');
  }

  /**
   * Delete a study session for the authenticated user and deduct study time from the course.
   */
  static async deleteStudySession(userId, sessionId) {
    const session = await StudySession.findOneAndDelete({
      _id: sessionId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!session) {
      const err = new Error('Study Session not found');
      err.statusCode = 404;
      throw err;
    }

    const learning = await Learning.findOne({
      _id: session.learningId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (learning) {
      const deductedHours = session.durationMinutes / 60;
      learning.completedHours = Math.max(0, (learning.completedHours || 0) - deductedHours);
      await this.updateLearningProgress(learning);
    }

    return session;
  }
}

module.exports = StudySessionService;
