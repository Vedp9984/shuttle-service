// routes/buses.js
const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// list buses
router.get('/', async (req, res) => {
  const buses = await Bus.find();
  res.json(buses);
});

// admin: create
router.post('/', auth, requireRole('Admin'), async (req, res) => {
  const b = new Bus(req.body);
  await b.save();
  res.status(201).json(b);
});

// admin: update location manually (if needed)
router.put('/:id/location', auth, requireRole('Admin'), async (req, res) => {
  const { latitude, longitude } = req.body;
  const bus = await Bus.findByIdAndUpdate(req.params.id, {
    currentLatitude: latitude,
    currentLongitude: longitude,
    lastUpdated: new Date()
  }, { new: true });
  res.json(bus);
});

module.exports = router;
