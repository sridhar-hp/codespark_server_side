// src/utils/validators.js

/**
 * Centralised custom validator helpers used by express‑validator schemas.
 */

const isStrongPassword = (value) => {
  // Minimum 8 chars, at least one uppercase, one lowercase, one number, one special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!strongPasswordRegex.test(value)) {
    throw new Error(
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
    );
  }
  return true;
};

module.exports = { isStrongPassword };
