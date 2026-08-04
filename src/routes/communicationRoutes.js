// src/routes/communicationRoutes.js
const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  validateCreateCommunication,
  validateUpdateCommunication,
  validateCommunicationId,
} = require('../validations/communicationValidation');

router.use(protect);

router.get('/', communicationController.getCommunications);
router.get('/stats', communicationController.getCommunicationStats);
router.get('/:id', validateCommunicationId, validate, communicationController.getCommunicationById);
router.post('/', validateCreateCommunication, validate, communicationController.createCommunication);
router.put('/:id', validateUpdateCommunication, validate, communicationController.updateCommunication);
router.delete('/:id', validateCommunicationId, validate, communicationController.deleteCommunication);
router.patch('/:id/complete', validateCommunicationId, validate, communicationController.markCompleted);
router.patch('/:id/missed', validateCommunicationId, validate, communicationController.markMissed);

module.exports = router;
