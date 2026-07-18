// src/routes/dailyProgressRoutes.js
const express = require('express');
const router = express.Router();
const dpController = require('../controllers/dailyProgressController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const dpValidate = require('../validations/dailyProgressValidation');

router.use(protect);

router.post('/', dpValidate.create, validate, dpController.record);
router.get('/date', dpController.getByDate); // ?date=YYYY-MM-DD
router.get('/range', dpController.getRange); // ?start=...&end=...

module.exports = router;
