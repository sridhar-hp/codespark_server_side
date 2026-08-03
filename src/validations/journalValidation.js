// src/validations/journalValidation.js
const { body, param } = require('express-validator');
const { MOOD_ENUM } = require('../models/Journal');

const MOOD_MAP = {
  '😀': 'Happy',
  '🙂': 'Focused',
  '🔥': 'Productive',
  '😐': 'Neutral',
  '😓': 'Stressed',
  '⚡': 'Excited',
  '😢': 'Sad',
  '😴': 'Tired',
};

const validateCreateJournal = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),

  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),

  body('mood')
    .optional()
    .customSanitizer((val) => MOOD_MAP[val] || val)
    .isIn(MOOD_ENUM)
    .withMessage(`Mood must be one of: ${MOOD_ENUM.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
];

const validateUpdateJournal = [
  param('id').isMongoId().withMessage('Invalid journal ID'),

  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),

  body('content')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),

  body('mood')
    .optional()
    .customSanitizer((val) => MOOD_MAP[val] || val)
    .isIn(MOOD_ENUM)
    .withMessage(`Mood must be one of: ${MOOD_ENUM.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
];

const validateJournalId = [
  param('id').isMongoId().withMessage('Invalid journal ID'),
];

module.exports = {
  validateCreateJournal,
  validateUpdateJournal,
  validateJournalId,
  MOOD_MAP,
};
