// routes/schedules.js
const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// list schedules (public with filters)
router.get('/', async (req, res) => {
  const { date, routeId } = req.query;
  const q = {};
  if (date) q.date = new Date(date);
  if (routeId) q.routeId = routeId;
  const list = await Schedule.find(q).populate('routeId busId driverId');
  res.json(list);
});

// admin: create schedule
router.post('/', auth, requireRole('Admin'), async (req, res) => {
  const s = new Schedule(req.body);
  await s.save();
  res.status(201).json(s);
});

// admin: update
router.put('/:id', auth, requireRole('Admin'), async (req, res) => {
  const s = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
});

module.exports = router;
