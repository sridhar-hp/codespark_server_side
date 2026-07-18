// src/validations/taskValidation.js
const { body, param } = require('express-validator');

exports.create = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('dueDate').optional().isISO8601().toDate(),
  body('xpReward').optional().isInt({ min: 0 }).toInt(),
];

exports.update = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title').optional().trim(),
  body('description').optional(),
  body('completed').optional().isBoolean(),
  body('dueDate').optional().isISO8601().toDate(),
  body('xpReward').optional().isInt({ min: 0 }).toInt(),
];

exports.delete = [param('id').isMongoId().withMessage('Invalid task ID')];
