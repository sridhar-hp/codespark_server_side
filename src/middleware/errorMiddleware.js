// src/middleware/errorMiddleware.js

/**
 * Global error handler – catches async errors & forwards them.
 */
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Server Error';
  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
