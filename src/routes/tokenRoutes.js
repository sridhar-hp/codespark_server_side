// src/routes/tokenRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const tokenValidate = require('../validations/tokenValidation');
const validate = require('../middleware/validationMiddleware');

router.post('/refresh', tokenValidate.refresh, validate, authController.refresh);

module.exports = router;
