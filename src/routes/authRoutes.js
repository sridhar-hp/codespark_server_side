// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
const { register, login } = require('../validations/authValidation');
const tokenValidate = require('../validations/tokenValidation');

router.post('/register', register, validate, authController.register);
router.post('/login', login, validate, authController.login);
router.post('/refresh', tokenValidate.refresh, validate, authController.refresh);
router.post('/logout', authController.logout); // token read from header

module.exports = router;
