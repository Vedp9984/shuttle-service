// models/Payment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  amount: Number,
  paymentDate: { type: Date, default: Date.now },
  method: String,
  status: { type: String, enum: ['Pending','Completed','Failed'], default: 'Pending' }
});

module.exports = mongoose.model('Payment', PaymentSchema);
