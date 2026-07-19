// src/validations/achievementValidation.js
const { body } = require('express-validator');

exports.create = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('points').isInt({ min: 0 }).toInt(),
  body('icon').optional().isURL(),
];
