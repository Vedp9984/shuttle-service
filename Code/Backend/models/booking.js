const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
  bookingDate: { type: Date, default: Date.now },
  seatNumber: { type: String },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed',
  },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model('Booking', bookingSchema);
