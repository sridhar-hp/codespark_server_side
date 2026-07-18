// src/validations/activityValidation.js
const { body } = require('express-validator');

exports.github = [
  body('repo').trim().notEmpty(),
  body('action').trim().notEmpty(),
];

exports.leetcode = [
  body('problemSlug').trim().notEmpty(),
  body('status').isIn(['accepted', 'failed']),
];

exports.learning = [
  body('resourceUrl').isURL(),
  body('title').trim().notEmpty(),
  body('durationMinutes').optional().isInt({ min: 0 }).toInt(),
];

exports.communication = [
  body('channel').trim().notEmpty(),
  body('messageId').trim().notEmpty(),
];

exports.linkedin = [
  body('activityType').trim().notEmpty(),
];
