// src/routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const achController = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', achController.list);
router.post('/check', achController.check);

module.exports = router;
