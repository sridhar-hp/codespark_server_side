// src/routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  validateCreateJournal,
  validateUpdateJournal,
  validateJournalId,
} = require('../validations/journalValidation');

router.use(protect);

router.get('/', journalController.getJournals);
router.get('/stats', journalController.getJournalStats);
router.get('/:id', validateJournalId, validate, journalController.getJournalById);
router.post('/', validateCreateJournal, validate, journalController.createJournal);
router.put('/:id', validateUpdateJournal, validate, journalController.updateJournal);
router.delete('/:id', validateJournalId, validate, journalController.deleteJournal);
router.patch('/:id/favorite', validateJournalId, validate, journalController.toggleFavorite);
router.patch('/:id/pin', validateJournalId, validate, journalController.togglePin);

module.exports = router;