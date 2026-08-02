// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const notificationValidation = require('../validations/notificationValidation');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post(
  '/',
  notificationValidation.create,
  validate,
  notificationController.createNotification
);

router.get('/', notificationController.getNotifications);

router.patch('/read-all', notificationController.markAllAsRead);

router.patch(
  '/:id/read',
  notificationValidation.getById,
  validate,
  notificationController.markAsRead
);

router.delete('/', notificationController.deleteAllNotifications);

router.delete(
  '/:id',
  notificationValidation.getById,
  validate,
  notificationController.deleteNotification
);

module.exports = router;