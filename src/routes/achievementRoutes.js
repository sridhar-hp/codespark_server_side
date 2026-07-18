// src/routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const achController = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');
const achValidate = require('../validations/achievementValidation');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/', achController.list);
router.post('/:id/earn', achController.earn); // Earn by achievement ID

module.exports = router;
