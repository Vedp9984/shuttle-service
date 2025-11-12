// --- START OF FILE routes/bookings.js ---

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// All booking operations require authentication (protect)
// Create a new booking
router.post('/', bookingController.createBooking);

// Get user's bookings (Protected and only for User/Admin)
router.get('/', bookingController.getUserBookings);

module.exports = router;