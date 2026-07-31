// src/routes/learningGoalRoutes.js
const express = require('express');
const router = express.Router();
const learningGoalController = require('../controllers/learningGoalController');
const learningGoalValidation = require('../validations/learningGoalValidation');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', learningGoalValidation.create, validate, learningGoalController.createGoal);
router.get('/', learningGoalController.getGoals);
router.get('/:id', learningGoalValidation.getById, validate, learningGoalController.getGoal);
router.put('/:id', learningGoalValidation.update, validate, learningGoalController.updateGoal);
router.delete('/:id', learningGoalValidation.delete, validate, learningGoalController.deleteGoal);

module.exports = router;
