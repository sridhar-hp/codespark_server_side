// src/validations/studySessionValidation.js
const { body, param } = require('express-validator');

exports.create = [
  body('learningId')
    .notEmpty()
    .withMessage('learningId is required')
    .isMongoId()
    .withMessage('Invalid Learning resource ID'),
  body('durationMinutes')
    .notEmpty()
    .withMessage('durationMinutes is required')
    .isFloat({ min: 1, max: 720 })
    .withMessage('durationMinutes must be a number between 1 and 720 minutes')
    .toFloat(),
  body('studyDate')
    .optional()
    .isISO8601()
    .withMessage('studyDate must be a valid ISO Date')
    .toDate(),
  body('notes').optional().isString().trim(),
];

exports.update = [
  param('id').isMongoId().withMessage('Invalid Study Session ID'),
  body('learningId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Learning resource ID'),
  body('durationMinutes')
    .optional()
    .isFloat({ min: 1, max: 720 })
    .withMessage('durationMinutes must be a number between 1 and 720 minutes')
    .toFloat(),
  body('studyDate')
    .optional()
    .isISO8601()
    .withMessage('studyDate must be a valid ISO Date')
    .toDate(),
  body('notes').optional().isString().trim(),
];

exports.getById = [
  param('id').isMongoId().withMessage('Invalid Study Session ID'),
];

exports.delete = [
  param('id').isMongoId().withMessage('Invalid Study Session ID'),
];
