// src/validations/omegaValidation.js
const { body } = require('express-validator');

const startSession = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('startTime').optional().isISO8601().withMessage('Valid start time date string required'),
  body('platform').optional().isString(),
];

const endSession = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('endTime').optional().isISO8601().withMessage('Valid end time date string required'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  body('conversationCount').optional().isNumeric(),
  body('talkTime').optional().isNumeric(),
  body('idleTime').optional().isNumeric(),
];

const addConversation = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('talkTime').optional().isNumeric(),
];

module.exports = {
  startSession,
  endSession,
  addConversation,
};
