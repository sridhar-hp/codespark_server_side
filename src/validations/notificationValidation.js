// src/validations/notificationValidation.js
const { body } = require('express-validator');

exports.create = [
  body('type').trim().notEmpty(),
  body('message').trim().notEmpty(),
];
