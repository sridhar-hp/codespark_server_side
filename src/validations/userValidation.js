// src/validations/userValidation.js
const { body, param } = require('express-validator');

exports.update = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
];
