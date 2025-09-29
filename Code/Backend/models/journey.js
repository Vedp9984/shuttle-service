const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const journeySchema = new Schema({
  // Route reference
  route: { 
    type: Schema.Types.ObjectId, 
    ref: 'Route', 
    required: true 
  },

  // Specific date of this journey
  date: { 
    type: Date, 
    required: true 
  },

  // Timings
  originDepartureTime: { type: String },   // 'HH:MM'
  destinationArrivalTime: { type: String },

  // Vehicle & Driver (dynamic per journey)
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // role=Driver

  // Seats
  totalSeats: { type: Number, required: true }, 
  bookedSeats: { type: Number, default: 0 },

  // Tracking
  currentStop: { type: Schema.Types.ObjectId, ref: 'BusStop' },
  delayMinutes: { type: Number, default: 0 },

  // Status
  status: { 
    type: String, 
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'], 
    default: 'Scheduled' 
  }

}, { timestamps: true });

module.exports = mongoose.model('Journey', journeySchema);
