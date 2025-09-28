// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// get profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// update profile
router.put('/me', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.passwordHash;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
