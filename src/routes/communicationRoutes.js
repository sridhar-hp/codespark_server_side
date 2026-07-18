// src/routes/communicationRoutes.js
const express = require('express');
const router = express.Router();
const commController = require('../controllers/communicationActivityController');
const { protect } = require('../middleware/authMiddleware');
const commValidate = require('../validations/activityValidation').communication;
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', commValidate, validate, commController.create);
router.get('/', commController.list);
module.exports = router;
