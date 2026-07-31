// src/validations/learningGoalValidation.js
const { body, param } = require('express-validator');
const { GOAL_STATUSES } = require('../models/LearningGoal');

exports.create = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString().trim(),
  body('targetHours')
    .notEmpty()
    .withMessage('targetHours is required')
    .isFloat({ min: 0.5 })
    .withMessage('targetHours must be a positive number')
    .toFloat(),
  body('completedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('completedHours must be a non-negative number')
    .toFloat(),
  body('deadline').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('status')
    .optional()
    .isIn(GOAL_STATUSES)
    .withMessage(`status must be one of: ${GOAL_STATUSES.join(', ')}`),
];

exports.update = [
  param('id').isMongoId().withMessage('Invalid Goal ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().trim(),
  body('targetHours')
    .optional()
    .isFloat({ min: 0.5 })
    .withMessage('targetHours must be a positive number')
    .toFloat(),
  body('completedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('completedHours must be a non-negative number')
    .toFloat(),
  body('deadline').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('status')
    .optional()
    .isIn(GOAL_STATUSES)
    .withMessage(`status must be one of: ${GOAL_STATUSES.join(', ')}`),
];

exports.getById = [param('id').isMongoId().withMessage('Invalid Goal ID')];
exports.delete = [param('id').isMongoId().withMessage('Invalid Goal ID')];
