// src/validations/notificationValidation.js
const { body, param } = require('express-validator');
const { NOTIFICATION_TYPES } = require('../models/Notification');

exports.create = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type')
    .optional()
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`Type must be one of: ${NOTIFICATION_TYPES.join(', ')}`),
  body('relatedEntity').optional().isMongoId().withMessage('Invalid related entity ID'),
  body('relatedEntityType').optional().isString().trim(),
];

exports.getById = [
  param('id').isMongoId().withMessage('Invalid Notification ID'),
];
