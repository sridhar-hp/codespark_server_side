// src/validations/tokenValidation.js
const { body } = require('express-validator');

exports.refresh = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
];
