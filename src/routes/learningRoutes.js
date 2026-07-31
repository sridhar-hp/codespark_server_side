// src/routes/learningRoutes.js
const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const learningAnalyticsController = require('../controllers/learningAnalyticsController');
const learningValidation = require('../validations/learningValidation');
const learningGoalRoutes = require('./learningGoalRoutes');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

// Protect all learning routes with authentication middleware
router.use(protect);

// Analytics & Heatmap endpoints
router.get('/analytics', learningAnalyticsController.getAnalytics);
router.get('/heatmap', learningAnalyticsController.getHeatmap);

// Learning Goals sub-router
router.use('/goals', learningGoalRoutes);

// Learning Resource CRUD endpoints
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
