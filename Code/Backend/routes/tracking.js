// routes/tracking.js
const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');

// get bus by ID
router.get('/bus/:id', async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json(bus);
});

// get real-time locations for a route: find schedules for a route today and return bus positions
router.get('/route/:routeId', async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const schedules = await Schedule.find({ routeId: req.params.routeId, date: today }).populate('busId');
  const active = schedules.map(s => ({
    scheduleId: s._id,
    bus: s.busId,
    status: s.status,
    departureTime: s.departureTime
  }));
  res.json(active);
});

module.exports = router;
