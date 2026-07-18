// src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/generate', analyticsController.generate);
router.get('/', analyticsController.fetch);

module.exports = router;
