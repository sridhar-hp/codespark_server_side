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
    const firstError = errors.array()[0]?.msg || 'Validation failed';
    const err = new Error(firstError);
    err.details = errors.array();
    return error(res, err, 400);
  }
  next();
};

module.exports = validate;
