// routes/routes.js
const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// list routes (public)
router.get('/', async (req, res) => {
  const routes = await Route.find().populate('stops');
  res.json(routes);
});

// admin: create
router.post('/', auth, requireRole('Admin'), async (req, res) => {
  const r = new Route(req.body);
  await r.save();
  res.status(201).json(r);
});

// admin: update
router.put('/:id', auth, requireRole('Admin'), async (req, res) => {
  const r = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(r);
});

// admin: delete
router.delete('/:id', auth, requireRole('Admin'), async (req, res) => {
  await Route.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
