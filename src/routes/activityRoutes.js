// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', activityController.getTimeline);
router.get('/recent', activityController.getRecent);
router.delete('/clear', activityController.clearActivity);

module.exports = router;
