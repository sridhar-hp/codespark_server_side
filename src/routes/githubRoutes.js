// src/routes/githubRoutes.js
const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubActivityController');
const { protect } = require('../middleware/authMiddleware');
const githubValidate = require('../validations/activityValidation').github;
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', githubValidate, validate, githubController.create);
router.get('/', githubController.list);
module.exports = router;
