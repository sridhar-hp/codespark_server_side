// src/utils/generateToken.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generates an access token (short‑lived) and a refresh token (long‑lived).
 * Both tokens embed the user ID and role.
 */
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
