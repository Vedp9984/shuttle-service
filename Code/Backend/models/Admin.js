// models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, index: true, unique: true, required: true },
  passwordHash: { type: String, required: true },
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', AdminSchema);
