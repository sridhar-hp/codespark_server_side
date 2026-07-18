// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const notifValidate = require('../validations/notificationValidation');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', notifValidate.create, validate, notifController.create);
router.get('/', notifController.list);
router.patch('/:id/read', notifController.markRead);
