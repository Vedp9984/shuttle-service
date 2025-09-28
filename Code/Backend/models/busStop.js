const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const busStopSchema = new Schema({
  stopName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

module.exports = mongoose.model('BusStop', busStopSchema);
