// routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

// list payments for current user (requires additional join in real app)
router.get('/', auth, async (req, res) => {
  const payments = await Payment.find({});
  res.json(payments);
});

module.exports = router;
