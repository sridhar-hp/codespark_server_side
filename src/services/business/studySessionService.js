// src/services/business/studySessionService.js
const StudySession = require('../../models/StudySession');
const Learning = require('../../models/Learning');

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
   * Create a new Study Session and automatically update the corresponding Learning course.
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

    // Adjust corresponding Learning course completedHours if duration changed
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

    // Deduct session duration from course completedHours
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
