// src/routes/githubRoutes.js
const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const { protect } = require('../middleware/authMiddleware');
const githubValidate = require('../validations/activityValidation').github;
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/connect', githubValidate, validate, githubController.connectGithub);
router.get('/profile', githubController.getGithubProfile);

module.exports = router;
