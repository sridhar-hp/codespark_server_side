// src/routes/studySessionRoutes.js
const express = require('express');
const router = express.Router();
const studySessionController = require('../controllers/studySessionController');
const studySessionValidation = require('../validations/studySessionValidation');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

// Protect all study session routes with authentication middleware
router.use(protect);

router.post(
  '/',
  studySessionValidation.create,
  validate,
  studySessionController.createStudySession
);

router.get('/', studySessionController.getStudySessions);

router.get(
  '/:id',
  studySessionValidation.getById,
  validate,
  studySessionController.getStudySession
);

router.put(
  '/:id',
  studySessionValidation.update,
  validate,
  studySessionController.updateStudySession
);

router.delete(
  '/:id',
  studySessionValidation.delete,
  validate,
  studySessionController.deleteStudySession
);

module.exports = router;
