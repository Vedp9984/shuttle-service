// routes/bookings.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { createPayment } = require('../utils/payments');
const mongoose = require('mongoose');

// helper: check modification allowed (>= 2 hours)
function canModifyBooking(scheduleDeparture) {
  const now = new Date();
  const diffMs = scheduleDeparture - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 2;
}

// create booking (user)
router.post('/', auth, async (req, res) => {
  try {
    const { scheduleId, seatNumber, paymentMethod } = req.body;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    if (schedule.availableSeats <= 0) return res.status(400).json({ error: 'No seats available' });

    // decrement seat
    schedule.availableSeats = schedule.availableSeats - 1;
    await schedule.save();

    const booking = new Booking({
      userId: req.user.id,
      scheduleId,
      seatNumber,
      amount: schedule.routePrice || schedule.amount ||  schedule.routePrice, // placeholder
      status: 'Confirmed'
    });
    await booking.save();

    // create payment record (stubbed)
    const payment = await createPayment(booking._id, booking.amount || schedule.routePrice || 0, paymentMethod || 'Credit Card');
    booking.paymentId = payment._id;
    await booking.save();

    res.status(201).json({ booking, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// modify booking (user) - allowed only if >= 2 hours before schedule departure
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('scheduleId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your booking' });

    const departure = booking.scheduleId.departureTime;
    if (!canModifyBooking(departure)) {
      return res.status(400).json({ error: 'Cannot modify booking within 2 hours of departure' });
    }

    // allow update seatNumber or others (but not scheduleId change here)
    if (req.body.seatNumber) booking.seatNumber = req.body.seatNumber;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Modify failed' });
  }
});

// cancel booking
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('scheduleId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your booking' });

    const departure = booking.scheduleId.departureTime;
    if (!canModifyBooking(departure)) {
      return res.status(400).json({ error: 'Cannot cancel booking within 2 hours of departure' });
    }

    // perform cancellation logic and refund (refund stubbed)
    booking.status = 'Cancelled';
    await booking.save();

    // restore seat
    await Schedule.findByIdAndUpdate(booking.scheduleId._id, { $inc: { availableSeats: 1 } });

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cancel failed' });
  }
});

// get user bookings
router.get('/me', auth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate('scheduleId');
  res.json(bookings);
});

module.exports = router;
