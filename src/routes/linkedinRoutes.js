// src/routes/linkedinRoutes.js
const express = require('express');
const router = express.Router();
const linkedInController = require('../controllers/linkedinController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', linkedInController.getProfile);
router.post('/', linkedInController.createProfile);
router.put('/', linkedInController.updateProfile);
router.put('/:id', linkedInController.updateProfile);

module.exports = router;
