const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const busSchema = new Schema({
  busNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  model: { type: String },
  currentLatitude: { type: Number },
  currentLongitude: { type: Number },
  lastUpdated: { type: Date },
});

module.exports = mongoose.model('Bus', busSchema);
