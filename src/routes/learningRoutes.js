// src/routes/learningRoutes.js
const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningActivityController');
const { protect } = require('../middleware/authMiddleware');
const learnValidate = require('../validations/activityValidation').learning;
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', learnValidate, validate, learningController.create);
router.get('/', learningController.list);
module.exports = router;
