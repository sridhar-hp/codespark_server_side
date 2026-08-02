// src/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.put('/profile', settingsController.updateProfile);
router.put('/password', settingsController.changePassword);
router.put('/preferences', settingsController.updatePreferences);
router.put('/theme', settingsController.updateTheme);
router.put('/privacy', settingsController.updatePrivacy);
router.post('/logout', settingsController.logout);
router.post('/logout-all', settingsController.logoutAll);

module.exports = router;
