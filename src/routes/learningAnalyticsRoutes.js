// src/routes/learningAnalyticsRoutes.js
const express = require('express');
const router = express.Router();
const learningAnalyticsController = require('../controllers/learningAnalyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', learningAnalyticsController.getAnalytics);
router.get('/heatmap', learningAnalyticsController.getHeatmap);

module.exports = router;
