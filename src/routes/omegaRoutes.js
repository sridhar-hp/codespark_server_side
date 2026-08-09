// src/routes/omegaRoutes.js
const express = require('express');
const router = express.Router();
const omegaController = require('../controllers/omegaController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const omegaValidate = require('../validations/omegaValidation');

// Debug middleware to log all incoming Omega route requests
router.use((req, res, next) => {
  console.log(`[OMEGA DEBUG] Route hit: ${req.method} ${req.originalUrl}`);
  console.log('[OMEGA DEBUG] Authorization Header:', req.headers.authorization ? 'PRESENT' : 'MISSING');
  console.log('[OMEGA DEBUG] Request Payload:', JSON.stringify(req.body));
  next();
});

router.use(protect);

router.post('/session/start', omegaValidate.startSession, validate, omegaController.startSession);
router.post('/session/end', omegaValidate.endSession, validate, omegaController.endSession);
router.post('/conversation', omegaValidate.addConversation, validate, omegaController.addConversation);
router.get('/stats', omegaController.getStats);
router.get('/history', omegaController.getHistory);

module.exports = router;
