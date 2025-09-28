// utils/payments.js
// Minimal payment stub — replace with real Stripe/PayPal SDK calls
const Payment = require('../models/Payment');

async function createPayment(bookingId, amount, method = 'Credit Card') {
  // In a real implementation you would call Stripe/PayPal and record result
  const p = new Payment({
    bookingId,
    amount,
    method,
    status: 'Completed',
    paymentDate: new Date()
  });
  await p.save();
  return p;
}

module.exports = { createPayment };
