// src/validations/learningValidation.js
const { body, param } = require('express-validator');
const { PLATFORMS, CATEGORIES, STATUSES } = require('../models/Learning');

const create = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString().trim(),
  body('platform')
    .optional()
    .isIn(PLATFORMS)
    .withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),
  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('instructor').optional().isString().trim(),
  body('thumbnail').optional().isString().trim(),
  body('resourceUrl')
    .trim()
    .notEmpty()
    .withMessage('Please enter a valid learning resource URL.')
    .isURL()
    .withMessage('Please enter a valid learning resource URL.'),
  body('totalHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total hours must be a non-negative number')
    .toFloat(),
  body('completedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Completed hours must be a non-negative number')
    .toFloat(),
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be a number between 0 and 100')
    .toFloat(),
  body('status')
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
];

const update = [
  param('id').isMongoId().withMessage('Invalid learning resource ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().trim(),
  body('platform')
    .optional()
    .isIn(PLATFORMS)
    .withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),
  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('instructor').optional().isString().trim(),
  body('thumbnail').optional().isString().trim(),
  body('resourceUrl')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Please enter a valid learning resource URL.')
    .isURL()
    .withMessage('Please enter a valid learning resource URL.'),
  body('totalHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total hours must be a non-negative number')
    .toFloat(),
  body('completedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Completed hours must be a non-negative number')
    .toFloat(),
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be a number between 0 and 100')
    .toFloat(),
  body('status')
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
];

const getById = [
  param('id').isMongoId().withMessage('Invalid learning resource ID'),
];

const deleteValidation = [
  param('id').isMongoId().withMessage('Invalid learning resource ID'),
];

module.exports = {
  create,
  update,
  getById,
  delete: deleteValidation,
};
