// src/validations/authValidation.js
const { body } = require('express-validator');
const { isStrongPassword } = require('../utils/validators');

exports.register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .custom(isStrongPassword)
    .withMessage('Password does not meet strength requirements'),
];

exports.login = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
