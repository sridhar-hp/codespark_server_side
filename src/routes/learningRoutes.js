// src/routes/learningRoutes.js
const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const learningValidation = require('../validations/learningValidation');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

// Protect all learning routes with authentication middleware
router.use(protect);

router.post(
  '/',
  learningValidation.create,
  validate,
  learningController.createLearning
);

router.get('/', learningController.getLearningList);

router.get(
  '/:id',
  learningValidation.getById,
  validate,
  learningController.getLearning
);

router.put(
  '/:id',
  learningValidation.update,
  validate,
  learningController.updateLearning
);

router.delete(
  '/:id',
  learningValidation.delete,
  validate,
  learningController.deleteLearning
);

module.exports = router;
