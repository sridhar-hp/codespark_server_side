// src/routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');
const journalValidate = require('../validations/journalValidation');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', journalValidate.create, validate, journalController.create);
router.get('/', journalController.list);
router.put('/:id', journalValidate.create, validate, journalController.update);
router.delete('/:id', journalController.delete);
