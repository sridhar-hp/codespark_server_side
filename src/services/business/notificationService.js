// src/services/business/notificationService.js
const Notification = require('../../models/Notification');

class NotificationService {
  /**
   * Helper function to safely create a notification for a user.
   */
  static async createNotification(userId, data) {
    try {
      const { title, message, type = 'SYSTEM', relatedEntity, relatedEntityType } = data;
      const notif = new Notification({
        user: userId,
        userId: userId,
        title: title || 'Notification',
        message: message || '',
        type,
        relatedEntity: relatedEntity || null,
        relatedEntityType: relatedEntityType || null,
        isRead: false,
        read: false,
      });
      await notif.save();
      return notif;
    } catch (err) {
      console.error('Notification creation failed silently:', err.message);
      return null;
    }
  }

  /**
   * Get notifications list for user (limit 25, sorted newest first) with unread count.
   */
  static async getNotifications(userId, limit = 25) {
    const userQuery = { $or: [{ user: userId }, { userId: userId }] };

    const notifications = await Notification.find(userQuery)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      ...userQuery,
      $or: [{ isRead: false }, { read: false }],
    });

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Mark a single notification as read for the user.
   */
  static async markAsRead(userId, notificationId) {
    const notif = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        $or: [{ user: userId }, { userId: userId }],
      },
      { isRead: true, read: true },
      { new: true }
    );

    if (!notif) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    return notif;
  }

  /**
   * Mark all notifications as read for the user.
   */
  static async markAllAsRead(userId) {
    const userQuery = { $or: [{ user: userId }, { userId: userId }] };

    await Notification.updateMany(userQuery, { isRead: true, read: true });

    return this.getNotifications(userId);
  }

  /**
   * Delete a single notification for the user.
   */
  static async deleteNotification(userId, notificationId) {
    const notif = await Notification.findOneAndDelete({
      _id: notificationId,
      $or: [{ user: userId }, { userId: userId }],
    });

    if (!notif) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    return notif;
  }

  /**
   * Delete all notifications for the user.
   */
  static async deleteAllNotifications(userId) {
    const userQuery = { $or: [{ user: userId }, { userId: userId }] };

    await Notification.deleteMany(userQuery);

    return { success: true, message: 'All notifications deleted' };
  }
}

module.exports = NotificationService;
