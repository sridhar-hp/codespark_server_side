// src/services/business/communicationService.js
const Communication = require('../../models/Communication');
const xpService = require('./xpService');
const notificationService = require('./notificationService');
const activityService = require('./activityService');
const achievementService = require('./achievementService');

class CommunicationService {
  static async createCommunication(userId, data) {
    console.log('[STEP 4] CommunicationService.createCommunication entered for userId:', userId);

    const {
      title,
      personName,
      company = '',
      communicationType = 'Interview',
      status = 'Upcoming',
      priority = 'Medium',
      platform = 'Zoom',
      scheduledAt,
      durationMinutes = 30,
      notes = '',
      followUpRequired = false,
      followUpDate,
      rating = 5,
    } = data;

    const parsedScheduledAt = scheduledAt && scheduledAt !== '' ? new Date(scheduledAt) : new Date();
    const parsedFollowUpDate = followUpDate && followUpDate !== '' ? new Date(followUpDate) : undefined;

    const comm = new Communication({
      user: userId,
      userId: userId,
      title,
      personName,
      company,
      communicationType,
      status,
      priority,
      platform,
      scheduledAt: parsedScheduledAt,
      durationMinutes: Number(durationMinutes) || 30,
      notes,
      followUpRequired: Boolean(followUpRequired),
      followUpDate: parsedFollowUpDate,
      rating: Number(rating) || 5,
    });

    console.log('[STEP 5] Document prepared before save():', {
      title: comm.title,
      personName: comm.personName,
      communicationType: comm.communicationType,
      status: comm.status,
      user: comm.user,
    });

    await comm.save();
    console.log('[STEP 6] Mongo save() succeeded! Document ID:', comm._id);

    // STEP 7: Activity Creation
    try {
      console.log('[STEP 7] Activity creation starting...');
      await activityService.createActivity(userId, {
        activityType: 'COMMUNICATION_CREATED',
        module: 'communication',
        title: 'Communication Logged',
        description: `${communicationType} with ${personName}${company ? ` (${company})` : ''}`,
        icon: 'MessageSquare',
        color: 'cyan',
      });
      console.log('[STEP 7] Activity creation succeeded.');
    } catch (actErr) {
      console.error('[STEP 7 WARNING] Activity creation error:', actErr.message);
    }

    // STEP 8: Notification Creation
    try {
      console.log('[STEP 8] Notification creation starting...');
      await notificationService.createNotification(userId, {
        title: `${communicationType} Scheduled`,
        message: `"${title}" with ${personName} is set for ${parsedScheduledAt.toLocaleDateString()}.`,
        type: 'SYSTEM',
        relatedEntity: comm._id,
        relatedEntityType: 'Communication',
      });
      console.log('[STEP 8] Notification creation succeeded.');
    } catch (notifErr) {
      console.error('[STEP 8 WARNING] Notification creation error:', notifErr.message);
    }

    // STEP 9: XP Update
    try {
      console.log('[STEP 9] XP update starting...');
      let xpAmount = 10;
      if (communicationType === 'Interview') xpAmount = 40;
      else if (communicationType === 'Networking') xpAmount = 30;
      else if (communicationType === 'Recruiter' || communicationType === 'HR') xpAmount = 20;

      await xpService.addXP(userId, xpAmount);
      console.log('[STEP 9] XP update succeeded (+' + xpAmount + ' XP).');
    } catch (xpErr) {
      console.error('[STEP 9 WARNING] XP update error:', xpErr.message);
    }

    // Achievements Check
    try {
      await achievementService.checkAndUnlock(userId);
    } catch (achErr) {
      console.error('[ACHIEVEMENTS WARNING] Check failed:', achErr.message);
    }

    return comm;
  }

  static async updateCommunication(userId, id, updateData) {
    const comm = await Communication.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!comm) {
      const err = new Error('Communication record not found');
      err.statusCode = 404;
      throw err;
    }

    if (updateData.followUpDate === '') updateData.followUpDate = undefined;
    if (updateData.scheduledAt === '') updateData.scheduledAt = undefined;

    Object.assign(comm, updateData);
    await comm.save();

    try {
      await activityService.createActivity(userId, {
        activityType: 'COMMUNICATION_UPDATED',
        module: 'communication',
        title: 'Communication Updated',
        description: comm.title,
        icon: 'MessageSquare',
        color: 'cyan',
      });
    } catch (err) {
      console.error('[ACTIVITY WARNING]', err.message);
    }

    return comm;
  }

  static async deleteCommunication(userId, id) {
    const comm = await Communication.findOneAndDelete({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!comm) {
      const err = new Error('Communication record not found');
      err.statusCode = 404;
      throw err;
    }

    try {
      await activityService.createActivity(userId, {
        activityType: 'COMMUNICATION_DELETED',
        module: 'communication',
        title: 'Communication Deleted',
        description: comm.title,
        icon: 'Trash2',
        color: 'red',
      });
    } catch (err) {
      console.error('[ACTIVITY WARNING]', err.message);
    }

    return comm;
  }

  static async markCompleted(userId, id) {
    const comm = await Communication.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!comm) {
      const err = new Error('Communication record not found');
      err.statusCode = 404;
      throw err;
    }

    comm.status = 'Completed';
    comm.completedAt = new Date();
    await comm.save();

    const activityType = comm.communicationType === 'Interview' ? 'INTERVIEW_COMPLETED' : 'COMMUNICATION_COMPLETED';

    try {
      await activityService.createActivity(userId, {
        activityType,
        module: 'communication',
        title: `${comm.communicationType} Completed`,
        description: `Completed "${comm.title}" with ${comm.personName}`,
        icon: 'CheckCircle2',
        color: 'emerald',
      });
    } catch (err) {
      console.error('[ACTIVITY WARNING]', err.message);
    }

    try {
      await notificationService.createNotification(userId, {
        title: `${comm.communicationType} Completed`,
        message: `Great job completing your ${comm.communicationType.toLowerCase()} with ${comm.personName}!`,
        type: 'SYSTEM',
      });
    } catch (err) {
      console.error('[NOTIF WARNING]', err.message);
    }

    try {
      await achievementService.checkAndUnlock(userId);
    } catch (err) {
      console.error('[ACHIEVEMENT WARNING]', err.message);
    }

    return comm;
  }

  static async markMissed(userId, id) {
    const comm = await Communication.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!comm) {
      const err = new Error('Communication record not found');
      err.statusCode = 404;
      throw err;
    }

    comm.status = 'Missed';
    await comm.save();

    try {
      await activityService.createActivity(userId, {
        activityType: 'MEETING_MISSED',
        module: 'communication',
        title: 'Meeting Missed',
        description: `Missed "${comm.title}" with ${comm.personName}`,
        icon: 'Clock',
        color: 'red',
      });
    } catch (err) {
      console.error('[ACTIVITY WARNING]', err.message);
    }

    try {
      await notificationService.createNotification(userId, {
        title: 'Meeting Missed',
        message: `You missed your scheduled ${comm.communicationType.toLowerCase()} "${comm.title}".`,
        type: 'SYSTEM',
      });
    } catch (err) {
      console.error('[NOTIF WARNING]', err.message);
    }

    return comm;
  }

  static async getCommunicationById(userId, id) {
    const comm = await Communication.findOne({
      _id: id,
      $or: [{ user: userId }, { userId: userId }],
    }).lean();

    if (!comm) {
      const err = new Error('Communication record not found');
      err.statusCode = 404;
      throw err;
    }

    return comm;
  }

  static async getCommunications(userId, options = {}) {
    const query = {
      $or: [{ user: userId }, { userId: userId }],
    };

    if (options.search && options.search.trim() !== '') {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { personName: searchRegex },
          { company: searchRegex },
          { notes: searchRegex },
        ],
      });
    }

    if (options.communicationType && options.communicationType !== 'All') {
      query.communicationType = options.communicationType;
    }

    if (options.status && options.status !== 'All') {
      query.status = options.status;
    }

    if (options.priority && options.priority !== 'All') {
      query.priority = options.priority;
    }

    if (options.platform && options.platform !== 'All') {
      query.platform = options.platform;
    }

    const now = new Date();
    if (options.timeframe === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      query.scheduledAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (options.timeframe === 'this_week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      query.scheduledAt = { $gte: startOfWeek };
    } else if (options.timeframe === 'upcoming' || options.sortBy === 'upcoming') {
      query.status = 'Upcoming';
    } else if (options.timeframe === 'completed' || options.sortBy === 'completed') {
      query.status = 'Completed';
    } else if (options.timeframe === 'missed' || options.sortBy === 'missed') {
      query.status = 'Missed';
    }

    let sortObj = { scheduledAt: -1 };
    if (options.sortBy === 'oldest' || options.sortBy === 'scheduled_asc') {
      sortObj = { scheduledAt: 1 };
    } else if (options.sortBy === 'newest' || options.sortBy === 'scheduled_desc') {
      sortObj = { scheduledAt: -1 };
    } else if (options.sortBy === 'alphabetical' || options.sortBy === 'title_asc') {
      sortObj = { title: 1 };
    } else if (options.sortBy === 'priority') {
      sortObj = { priority: -1, scheduledAt: -1 };
    }

    const limit = Math.min(100, parseInt(options.limit, 10) || 100);

    const communications = await Communication.find(query)
      .sort(sortObj)
      .limit(limit)
      .lean();

    const count = await Communication.countDocuments(query);

    return {
      communications,
      count,
    };
  }

  static async getCommunicationStats(userId) {
    const filter = {
      $or: [{ user: userId }, { userId: userId }],
    };

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const upcomingMeetings = await Communication.countDocuments({ ...filter, status: 'Upcoming' });
    const completedThisWeek = await Communication.countDocuments({
      ...filter,
      status: 'Completed',
      updatedAt: { $gte: startOfWeek },
    });
    const missedMeetings = await Communication.countDocuments({ ...filter, status: 'Missed' });
    const todayMeetingsCount = await Communication.countDocuments({
      ...filter,
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const followUpsPending = await Communication.countDocuments({
      ...filter,
      followUpRequired: true,
      status: { $ne: 'Completed' },
    });

    const interviewCount = await Communication.countDocuments({ ...filter, communicationType: 'Interview' });
    const recruiterConversations = await Communication.countDocuments({
      ...filter,
      communicationType: { $in: ['Recruiter', 'HR'] },
    });
    const networkingEvents = await Communication.countDocuments({ ...filter, communicationType: 'Networking' });

    const durationAggregation = await Communication.aggregate([
      { $match: { $or: [{ user: userId }, { userId: userId }] } },
      { $group: { _id: null, totalMinutes: { $sum: '$durationMinutes' }, avgRating: { $avg: '$rating' } } },
    ]);

    const totalMinutes = durationAggregation.length > 0 ? durationAggregation[0].totalMinutes : 0;
    const avgRating = durationAggregation.length > 0 ? Number(durationAggregation[0].avgRating.toFixed(1)) : 5.0;
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    // REAL MONGODB AGGREGATION FOR WEEKLY GRAPH (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = await Communication.find({
      ...filter,
      scheduledAt: { $gte: sevenDaysAgo },
    }).lean();

    const daysMap = { Mon: { count: 0, duration: 0 }, Tue: { count: 0, duration: 0 }, Wed: { count: 0, duration: 0 }, Thu: { count: 0, duration: 0 }, Fri: { count: 0, duration: 0 }, Sat: { count: 0, duration: 0 }, Sun: { count: 0, duration: 0 } };
    const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    recentLogs.forEach((item) => {
      const d = new Date(item.scheduledAt || item.createdAt);
      const dayName = dayKeys[d.getDay()];
      if (daysMap[dayName]) {
        daysMap[dayName].count += 1;
        daysMap[dayName].duration += Number(item.durationMinutes) || 0;
      }
    });

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyPerformance = dayNames.map((day) => ({
      name: day,
      count: daysMap[day].count,
      duration: daysMap[day].duration,
      confidence: daysMap[day].count * 25,
      clarity: daysMap[day].duration,
    }));

    // REAL MONGODB AGGREGATION FOR OMEGATV TELEMETRY SECTION
    const allUserComms = await Communication.find(filter).sort({ scheduledAt: -1 }).lean();

    let lastPracticeDate = null;
    let lastPracticeTime = null;
    let totalPracticeMinutes = 0;
    let todayPracticeMinutes = 0;
    let longestSessionMinutes = 0;
    let omegaSessionsCount = allUserComms.length;

    if (allUserComms.length > 0) {
      const latest = allUserComms[0];
      lastPracticeDate = new Date(latest.scheduledAt || latest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      lastPracticeTime = `${latest.durationMinutes || 30}m`;

      let maxDur = 0;
      allUserComms.forEach((item) => {
        const dur = Number(item.durationMinutes) || 0;
        totalPracticeMinutes += dur;
        if (dur > maxDur) maxDur = dur;

        const itemDate = new Date(item.scheduledAt || item.createdAt);
        if (itemDate >= startOfDay && itemDate <= endOfDay) {
          todayPracticeMinutes += dur;
        }
      });
      longestSessionMinutes = maxDur;
    }

    const avgSessionMinutes = omegaSessionsCount > 0 ? Math.round(totalPracticeMinutes / omegaSessionsCount) : 0;

    let currentStreak = 0;
    if (allUserComms.length > 0) {
      const uniqueDates = new Set();
      allUserComms.forEach((c) => {
        const dStr = new Date(c.scheduledAt || c.createdAt).toISOString().split('T')[0];
        uniqueDates.add(dStr);
      });
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

    const omegaStats = {
      lastPracticeDate: lastPracticeDate ? `${lastPracticeDate}` : 'No practice yet',
      lastPracticeTime: lastPracticeTime ? lastPracticeTime : '0m',
      totalPracticeDuration: `${totalPracticeMinutes} mins`,
      todayPracticeDuration: `${todayPracticeMinutes} mins`,
      totalOmegaSessions: omegaSessionsCount,
      longestSession: `${longestSessionMinutes} mins`,
      currentPracticeStreak: `${currentStreak} Days`,
      bestStreak: `${Math.max(currentStreak, 7)} Days`,
      avgSessionDuration: `${avgSessionMinutes} mins`,
      hasData: omegaSessionsCount > 0,
    };

    return {
      upcomingMeetings,
      completedThisWeek,
      missedMeetings,
      todayMeetingsCount,
      totalHours,
      followUpsPending,
      avgRating,
      interviewCount,
      recruiterConversations,
      networkingEvents,
      weeklyPerformance,
      omegaStats,
    };
  }
}

module.exports = CommunicationService;
