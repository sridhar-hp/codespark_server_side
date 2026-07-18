// src/routes/leetcodeRoutes.js
const express = require('express');
const router = express.Router();
const leetController = require('../controllers/leetcodeActivityController');
const { protect } = require('../middleware/authMiddleware');
const leetValidate = require('../validations/activityValidation').leetcode;
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', leetValidate, validate, leetController.create);
router.get('/', leetController.list);
module.exports = router;
