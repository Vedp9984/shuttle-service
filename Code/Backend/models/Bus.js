// models/Bus.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const BusSchema = new Schema({
  busNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, default: 0 },
  model: String,
  currentLatitude: Number,
  currentLongitude: Number,
  lastUpdated: Date
});

module.exports = mongoose.model('Bus', BusSchema);
