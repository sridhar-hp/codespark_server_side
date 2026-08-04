// src/validations/communicationValidation.js
const { body, param } = require('express-validator');
const {
  TYPE_ENUM,
  STATUS_ENUM,
  PRIORITY_ENUM,
  PLATFORM_ENUM,
} = require('../models/Communication');

const validateCreateCommunication = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),

  body('personName')
    .notEmpty()
    .withMessage('Person Name is required')
    .isString()
    .trim(),

  body('company')
    .optional()
    .isString()
    .trim(),

  body('communicationType')
    .notEmpty()
    .withMessage('Communication type is required')
    .isIn(TYPE_ENUM)
    .withMessage(`Communication type must be one of: ${TYPE_ENUM.join(', ')}`),

  body('status')
    .optional()
    .isIn(STATUS_ENUM)
    .withMessage(`Status must be one of: ${STATUS_ENUM.join(', ')}`),

  body('priority')
    .optional()
    .isIn(PRIORITY_ENUM)
    .withMessage(`Priority must be one of: ${PRIORITY_ENUM.join(', ')}`),

  body('platform')
    .optional()
    .isIn(PLATFORM_ENUM)
    .withMessage(`Platform must be one of: ${PLATFORM_ENUM.join(', ')}`),

  body('durationMinutes')
    .optional()
    .isInt({ min: 0, max: 600 })
    .withMessage('Duration must be between 0 and 600 minutes'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('followUpDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Follow-up date must be a valid date')
    .custom((val, { req }) => {
      if (req.body.scheduledAt && new Date(val) < new Date(req.body.scheduledAt)) {
        throw new Error('Follow-up date must be after scheduled date');
      }
      return true;
    }),
];

const validateUpdateCommunication = [
  param('id').isMongoId().withMessage('Invalid communication ID'),

  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),

  body('personName')
    .optional()
    .isString()
    .trim(),

  body('communicationType')
    .optional()
    .isIn(TYPE_ENUM)
    .withMessage(`Communication type must be one of: ${TYPE_ENUM.join(', ')}`),

  body('status')
    .optional()
    .isIn(STATUS_ENUM)
    .withMessage(`Status must be one of: ${STATUS_ENUM.join(', ')}`),

  body('durationMinutes')
    .optional()
    .isInt({ min: 0, max: 600 })
    .withMessage('Duration must be between 0 and 600 minutes'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

const validateCommunicationId = [
  param('id').isMongoId().withMessage('Invalid communication ID'),
];

module.exports = {
  validateCreateCommunication,
  validateUpdateCommunication,
  validateCommunicationId,
};
