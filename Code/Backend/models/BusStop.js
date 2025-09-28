// models/BusStop.js
const mongoose = require('mongoose');

const BusStopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
});

module.exports = mongoose.model('BusStop', BusStopSchema);
