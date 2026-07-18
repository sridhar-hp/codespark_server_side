// src/validations/journalValidation.js
const { body } = require('express-validator');

exports.create = [
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
];
