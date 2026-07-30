// src/routes/leetcodeRoutes.js
const express = require('express');
const router = express.Router();
const leetCodeController = require('../controllers/leetcodeController');
const { protect } = require('../middleware/authMiddleware');
const leetValidate = require('../validations/activityValidation').leetcode;
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/connect', leetValidate, validate, leetCodeController.connectLeetCode);
router.post('/sync', leetCodeController.syncLeetCode);
router.get('/profile', leetCodeController.getLeetCodeProfile);
router.get('/activity', leetCodeController.getLeetCodeActivity);
router.get('/stats', leetCodeController.getLeetCodeStats);

module.exports = router;
