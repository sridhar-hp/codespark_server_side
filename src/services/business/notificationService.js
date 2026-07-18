// src/services/business/notificationService.js
const Notification = require('../../models/Notification');

class NotificationService {
  static async create(userId, { type, message, metadata = {} }) {
    return Notification.create({
      user: userId,
      type,
      message,
      metadata,
    });
  }

  static async list(userId, onlyUnread = false) {
    const filter = { user: userId };
    if (onlyUnread) filter.read = false;
    return Notification.find(filter).sort({ createdAt: -1 });
  }

  static async markRead(notificationId, userId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
    if (!notif) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }
    return notif;
  }
}

module.exports = NotificationService;
