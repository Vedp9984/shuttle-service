// routes/drivers.js
const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const Schedule = require('../models/Schedule');

// driver profile
router.get('/me', auth, requireRole('Driver'), async (req, res) => {
  const driver = await Driver.findById(req.user.id).select('-passwordHash');
  res.json(driver);
});

// driver: view assigned schedules
router.get('/schedules', auth, requireRole('Driver'), async (req, res) => {
  const schedules = await Schedule.find({ driverId: req.user.id }).populate('routeId busId');
  res.json(schedules);
});

// driver: update schedule status
router.post('/schedules/:id/status', auth, requireRole('Driver'), async (req, res) => {
  const { status } = req.body;
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
  if (schedule.driverId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your schedule' });
  schedule.status = status;
  await schedule.save();
  res.json(schedule);
});

module.exports = router;
