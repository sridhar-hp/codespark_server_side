// src/validations/dailyProgressValidation.js
const { body } = require('express-validator');

exports.create = [
  body('date').isISO8601().toDate().withMessage('Valid date required'),
  body('tasksCompleted').optional().isInt({ min: 0 }).toInt(),
  body('xpEarned').optional().isInt({ min: 0 }).toInt(),
];
