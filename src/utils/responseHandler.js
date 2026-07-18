// src/utils/responseHandler.js

/**
 * Standard API response helper.
 * Usage: return responseHandler.success(res, data, message);
 *        return responseHandler.error(res, error, statusCode);
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, err, statusCode = 500) => {
  const message = err?.message || 'Server Error';
  const details = err?.details || null;
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

module.exports = { success, error };
