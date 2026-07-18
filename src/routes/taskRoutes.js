// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const taskValidate = require('../validations/taskValidation');

router.use(protect);

router.post('/', taskValidate.create, validate, taskController.create);
router.get('/', taskController.list);
router.get('/:id', taskValidate.delete, taskController.get);
router.put('/:id', taskValidate.update, validate, taskController.update);
router.delete('/:id', taskValidate.delete, taskController.delete);
router.patch('/:id/toggle', taskController.toggleComplete);

module.exports = router;
