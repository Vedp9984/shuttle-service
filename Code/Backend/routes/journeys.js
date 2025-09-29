const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');

// CRUD endpoints
router.post('/', journeyController.createJourney);
router.get('/', journeyController.getJourneys);
router.get('/:id', journeyController.getJourneyById);
router.put('/:id', journeyController.updateJourney);
router.delete('/:id', journeyController.deleteJourney);

module.exports = router;
