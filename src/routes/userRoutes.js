// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const userValidate = require('../validations/userValidation');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile/:id', userValidate.update, validate, userController.updateProfile);

module.exports = router;
