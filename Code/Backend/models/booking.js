// --- START OF FILE models/booking.js (FIXED: REFERS TO 'Journey') ---

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  // FIX: Referencing the actual operational model 'Journey' instead of the unused 'Schedule'
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  journeyId: { type: Schema.Types.ObjectId, ref: 'Journey', required: true }, 
  
  bookingDate: { type: Date, default: Date.now },
  seatNumber: { type: String }, // Compromise: Stores comma-separated seats
  paymentMethod: { type: String, enum: ['Card',  'UPI'], default: 'UPI' },
  transactionId: { type: String }, 
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Pending', 'Completed'],
    default: 'Confirmed',
  },
  amount: { type: Number, required: true },
  notes: { type: String },
});


module.exports = mongoose.model('Booking', bookingSchema);
// --- END OF FILE models/booking.js ---