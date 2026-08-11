// src/services/business/omegaService.js
const OmegaSession = require('../../models/OmegaSession');
const Communication = require('../../models/Communication');
const xpService = require('./xpService');
const notificationService = require('./notificationService');
const activityService = require('./activityService');
const dailyProgressService = require('./dailyProgressService');
const achievementService = require('./achievementService');

class OmegaService {
  static async startSession(userId, data) {
    console.log('[TEMPORARY LOG] Service entered: startSession for User ID:', userId);

    const { sessionId, startTime, platform = 'OmegaTV' } = data;
    const sessionDate = new Date(startTime || Date.now()).toISOString().split('T')[0];

    try {
      console.log('[TEMPORARY LOG] Before MongoDB save (startSession)');
      const session = await OmegaSession.findOneAndUpdate(
        { sessionId },
        {
          user: userId,
          userId: userId,
          sessionId,
          startTime: startTime ? new Date(startTime) : new Date(),
          platform,
          status: 'Active',
          date: sessionDate,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log('[TEMPORARY LOG] After MongoDB save (startSession):', session._id, 'SessionId:', session.sessionId);
      return session;
    } catch (mongoErr) {
      console.error('[OMEGA DEBUG] Mongo save failed (startSession):', mongoErr.message, mongoErr.stack);
      throw mongoErr;
    }
  }

  static async endSession(userId, data) {
    console.log('[TEMPORARY LOG] Service entered: endSession for User ID:', userId);

    const { sessionId, endTime, duration, conversationCount = 0, talkTime = 0, idleTime = 0 } = data;

    let session = await OmegaSession.findOne({ sessionId, $or: [{ user: userId }, { userId: userId }] });

    const endDt = endTime ? new Date(endTime) : new Date();
    const durSec = Number(duration) || (session ? Math.round((endDt - new Date(session.startTime)) / 1000) : 60);
    const durMins = Math.max(1, Math.round(durSec / 60));
    const sessionDate = endDt.toISOString().split('T')[0];

    if (!session) {
      session = new OmegaSession({
        user: userId,
        userId: userId,
        sessionId,
        startTime: new Date(Date.now() - durSec * 1000),
        endTime: endDt,
        duration: durSec,
        durationMinutes: durMins,
        status: 'Completed',
        conversationCount: Number(conversationCount) || 0,
        talkTime: Number(talkTime) || Math.round(durSec * 0.8),
        idleTime: Number(idleTime) || Math.round(durSec * 0.2),
        date: sessionDate,
      });
    } else {
      session.endTime = endDt;
      session.duration = durSec;
      session.durationMinutes = durMins;
      session.status = 'Completed';
      session.conversationCount = Number(conversationCount) || session.conversationCount;
      session.talkTime = Number(talkTime) || session.talkTime;
      session.idleTime = Number(idleTime) || session.idleTime;
    }

    try {
      console.log('[TEMPORARY LOG] Before MongoDB save (endSession)');
      await session.save();
      console.log('[TEMPORARY LOG] After MongoDB save (endSession):', session._id, 'Duration:', durMins, 'mins');
    } catch (mongoErr) {
      console.error('[OMEGA DEBUG] Mongo save failed (endSession):', mongoErr.message, mongoErr.stack);
      throw mongoErr;
    }

    // 1. XP Integration: 1 XP per minute + 10 bonus XP per conversation
    const xpEarned = Math.max(10, durMins * 1 + (session.conversationCount * 10));
    try {
      await xpService.addXP(userId, xpEarned);
    } catch (err) {
      console.error('[Omega XP Error]', err.message);
    }

    // 2. Activity Timeline Integration
    try {
      await activityService.createActivity(userId, {
        activityType: 'OMEGA_SESSION_COMPLETED',
        module: 'communication',
        title: 'OmegaTV Practice Session',
        description: `Logged ${durMins} mins of practice (${session.conversationCount} conversations)`,
        icon: 'Zap',
        color: 'amber',
      });
    } catch (err) {
      console.error('[Omega Activity Error]', err.message);
    }

    // 3. Notification Center Integration
    try {
      await notificationService.createNotification(userId, {
        title: 'OmegaTV Session Synced!',
        message: `Great practice session! You logged ${durMins} mins on OmegaTV and earned +${xpEarned} XP.`,
        type: 'SYSTEM',
      });
    } catch (err) {
      console.error('[Omega Notification Error]', err.message);
    }

    // 4. Communication Log Integration
    try {
      await Communication.create({
        user: userId,
        userId: userId,
        title: `OmegaTV Practice (${durMins}m)`,
        personName: `OmegaTV User (${session.conversationCount} chats)`,
        company: 'OmegaTV',
        communicationType: 'Mock Interview',
        status: 'Completed',
        priority: 'Medium',
        platform: 'Other',
        scheduledAt: session.startTime,
        completedAt: endDt,
        durationMinutes: durMins,
        notes: `Automated Chrome Extension Log: ${session.conversationCount} conversations, ${Math.round(session.talkTime / 60)}m talk time.`,
        rating: 5,
      });
    } catch (err) {
      console.error('[Omega Communication Log Error]', err.message);
    }

    // 5. Daily Progress & Heatmap Integration
    try {
      await dailyProgressService.record(userId, {
        date: sessionDate,
        tasksCompleted: 1,
        xpEarned,
      });
    } catch (err) {
      console.error('[Omega Heatmap Error]', err.message);
    }

    // 6. Achievement Unlocks
    try {
      await achievementService.checkAndUnlock(userId);
    } catch (err) {
      console.error('[Omega Achievement Error]', err.message);
    }

    return session;
  }

  static async addConversation(userId, data) {
    console.log('[TEMPORARY LOG] Service entered: addConversation for User ID:', userId);
    const { sessionId, talkTime = 30 } = data;
    const session = await OmegaSession.findOne({ sessionId, $or: [{ user: userId }, { userId: userId }] });

    if (session) {
      session.conversationCount = (session.conversationCount || 0) + 1;
      session.talkTime = (session.talkTime || 0) + Number(talkTime);
      console.log('[TEMPORARY LOG] Before MongoDB save (addConversation)');
      await session.save();
      console.log('[TEMPORARY LOG] After MongoDB save (addConversation):', session._id);
    }
    return session;
  }

  static async getStats(userId) {
    const filter = { $or: [{ user: userId }, { userId: userId }] };
    const sessions = await OmegaSession.find(filter).sort({ startTime: -1 }).lean();

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    let totalDurationSeconds = 0;
    let todayDurationSeconds = 0;
    let longestSessionSeconds = 0;
    let todaySessionsCount = 0;
    let totalConversationsCount = 0;

    sessions.forEach((s) => {
      const dur = Number(s.duration) || 0;
      totalDurationSeconds += dur;
      if (dur > longestSessionSeconds) longestSessionSeconds = dur;
      totalConversationsCount += Number(s.conversationCount) || 0;

      const sDate = new Date(s.startTime || s.createdAt);
      if (sDate >= startOfDay && sDate <= endOfDay) {
        todayDurationSeconds += dur;
        todaySessionsCount += 1;
      }
    });

    const totalSessions = sessions.length;
    const avgSessionSeconds = totalSessions > 0 ? Math.round(totalDurationSeconds / totalSessions) : 0;
    const lastSession = sessions.length > 0 ? sessions[0] : null;

    let currentStreak = 0;
    if (sessions.length > 0) {
      const uniqueDates = new Set(sessions.map((s) => s.date));
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
    }

    return {
      lastPracticeDate: lastSession ? new Date(lastSession.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No practice yet',
      lastPracticeTime: lastSession ? `${Math.round((lastSession.duration || 60) / 60)}m` : '0m',
      totalPracticeDuration: `${Math.round(totalDurationSeconds / 60)} mins`,
      todayPracticeDuration: `${Math.round(todayDurationSeconds / 60)} mins`,
      totalOmegaSessions: totalSessions,
      longestSession: `${Math.round(longestSessionSeconds / 60)} mins`,
      currentPracticeStreak: `${currentStreak} Days`,
      bestStreak: `${Math.max(currentStreak, 7)} Days`,
      avgSessionDuration: `${Math.round(avgSessionSeconds / 60)} mins`,
      todaySessionsCount,
      totalConversationsCount,
      hasData: totalSessions > 0,
      lastSync: new Date().toISOString(),
    };
  }

  static async getHistory(userId, limit = 20) {
    const filter = { $or: [{ user: userId }, { userId: userId }] };
    return OmegaSession.find(filter).sort({ startTime: -1 }).limit(Number(limit) || 20).lean();
  }
}

module.exports = OmegaService;
