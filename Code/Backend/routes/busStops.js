// routes/busStops.js
const express = require('express');
const router = express.Router();
const BusStop = require('../models/BusStop');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// public: list bus stops
router.get('/', async (req, res) => {
  const stops = await BusStop.find();
  res.json(stops);
});

// admin: create bus stop
router.post('/', auth, requireRole('Admin'), async (req, res) => {
  const stop = new BusStop(req.body);
  await stop.save();
  res.status(201).json(stop);
});

module.exports = router;
