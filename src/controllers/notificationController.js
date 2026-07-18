// src/controllers/notificationController.js
const NotificationService = require('../services/business/notificationService');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, res) => {
  try {
    const notif = await NotificationService.create(req.user.id, req.body);
    return success(res, notif, 'Notification created', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.list = async (req, res) => {
  try {
    const onlyUnread = req.query.unread === 'true';
    const notifs = await NotificationService.list(req.user.id, onlyUnread);
    return success(res, notifs, 'Notifications retrieved');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.markRead = async (req, res) => {
  try {
    const notif = await NotificationService.markRead(
      req.params.id,
      req.user.id
    );
    return success(res, notif, 'Notification marked read');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
