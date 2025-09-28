const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Scheduled', 'In Transit', 'Completed', 'Cancelled', 'Delayed'],
    default: 'Scheduled',
  },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
