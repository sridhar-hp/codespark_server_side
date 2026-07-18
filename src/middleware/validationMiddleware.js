// src/middleware/validationMiddleware.js

const { validationResult } = require('express-validator');
const { error } = require('../utils/responseHandler');

/**
 * Wraps express‑validator checks.
 * Returns 400 with details if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, new Error('Validation failed'), 400);
  }
  next();
};

module.exports = validate;
