// models/Driver.js
const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  username: { type: String, index: true, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: String,
  licenseNumber: String,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Driver', DriverSchema);
