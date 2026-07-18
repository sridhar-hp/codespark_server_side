// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();
const { error } = require('../utils/responseHandler');

/**
 * Protect routes – validates JWT access token.
 * Adds `req.user` with `{ id, role }`.
 */
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return error(res, new Error('Not authorized, token missing'), 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return error(res, new Error('Not authorized, token invalid'), 401);
  }
};

/**
 * Role‑based access control.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, new Error('Forbidden: insufficient permissions'), 403);
  }
  next();
};

module.exports = { protect, authorize };
