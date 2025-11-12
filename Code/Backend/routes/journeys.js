// --- START OF FILE routes/journeys.js (FINAL) ---

const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');

// ------------------------------------
// 🧑‍✈️ DRIVER/USER/PUBLIC ENDPOINTS
// ------------------------------------

// 📌 Search journeys by origin/destination/date (Public/User)
router.get('/search', journeyController.searchJourneys);

// 📌 Get driver's specific journeys (Driver)
// GET /api/journeys/driver?driverId=<id>&type=<current|upcoming|past>
router.get('/driver', journeyController.getDriverJourneys);

// 📌 Driver updates status of a journey (Driver)
// PATCH /api/journeys/:id/status
router.patch('/:id/status', journeyController.updateJourneyStatus);


// ------------------------------------
// ⚙️ ADMIN CRUD ENDPOINTS
// ------------------------------------

router.get('/', journeyController.getJourneys);
router.get('/:id', journeyController.getJourneyById);
router.post('/', journeyController.createJourney);
router.put('/:id', journeyController.updateJourney);
router.delete('/:id', journeyController.deleteJourney);

module.exports = router;

// --- END OF FILE routes/journeys.js ---