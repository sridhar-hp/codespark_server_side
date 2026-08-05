// src/routes/omegaRoutes.js
const express = require('express');
const router = express.Router();
const omegaController = require('../controllers/omegaController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const omegaValidate = require('../validations/omegaValidation');

router.use(protect);

router.post('/session/start', omegaValidate.startSession, validate, omegaController.startSession);
router.post('/session/end', omegaValidate.endSession, validate, omegaController.endSession);
router.post('/conversation', omegaValidate.addConversation, validate, omegaController.addConversation);
router.get('/stats', omegaController.getStats);
router.get('/history', omegaController.getHistory);

module.exports = router;
