// src/controllers/notificationController.js
const NotificationService = require('../services/business/notificationService');
const { success, error } = require('../utils/responseHandler');

const createNotification = async (req, res) => {
  try {
    const notif = await NotificationService.createNotification(req.user.id, req.body);
    return success(res, notif, 'Notification created successfully', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 25;
    const result = await NotificationService.getNotifications(req.user.id, limit);
    return success(res, result, 'Notifications retrieved successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const markAsRead = async (req, res) => {
  try {
    const notif = await NotificationService.markAsRead(req.user.id, req.params.id);
    return success(res, notif, 'Notification marked as read');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user.id);
    return success(res, result, 'All notifications marked as read');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notif = await NotificationService.deleteNotification(req.user.id, req.params.id);
    return success(res, notif, 'Notification deleted successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const result = await NotificationService.deleteAllNotifications(req.user.id);
    return success(res, result, 'All notifications deleted successfully');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  // Backward compatibility aliases
  create: createNotification,
  list: getNotifications,
  markRead: markAsRead,
};
