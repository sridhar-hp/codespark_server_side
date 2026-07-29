// src/routes/githubRoutes.js
const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/connect', githubController.connect);
router.get('/profile', githubController.getProfile);

module.exports = router;
