// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// get notifications (for user)
router.get('/', auth, async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user.id }).sort('-timestamp');
  res.json(notifications);
});

// admin can push notification (broadcast or to a specific recipient)
router.post('/', auth, async (req, res) => {
  // ideally check admin role; for brevity assume authenticated admin or provide role check
  const { recipientId, recipientType='User', type, message } = req.body;
  const n = new Notification({ recipientId, recipientType, type, message });
  await n.save();
  res.status(201).json(n);
});

module.exports = router;
