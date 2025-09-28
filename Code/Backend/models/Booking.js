// models/Booking.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
  bookingDate: { type: Date, default: Date.now },
  seatNumber: String,
  status: { type: String, enum: ['Confirmed','Cancelled'], default: 'Confirmed' },
  amount: { type: Number, default: 0.0 },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' }
});

module.exports = mongoose.model('Booking', BookingSchema);
