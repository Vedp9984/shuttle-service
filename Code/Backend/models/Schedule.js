// models/Schedule.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScheduleSchema = new Schema({
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled','In Transit','Delayed','Completed','Cancelled'], default: 'Scheduled' },
  totalSeats: { type: Number, default: 0 },
  availableSeats: { type: Number, default: 0 }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
