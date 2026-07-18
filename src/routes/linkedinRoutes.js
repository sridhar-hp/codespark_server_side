// src/routes/linkedinRoutes.js
const express = require('express');
const router = express.Router();
const linkedInController = require('../controllers/linkedinActivityController');
const { protect } = require('../middleware/authMiddleware');
const linkedValidate = require('../validations/activityValidation').linkedin;
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', linkedValidate, validate, linkedInController.create);
router.get('/', linkedInController.list);
module.exports = router;
