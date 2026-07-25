// src/utils/validators.js

/**
 * Centralised custom validator helpers used by express‑validator schemas.
 */

const isStrongPassword = (value) => {
  if (!value || value.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return true;
};

module.exports = { isStrongPassword };
