const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
  plateNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    uppercase: true 
  },

  model: { type: String, required: true },
  manufacturer: { type: String },
  year: { type: Number },

  totalSeats: { type: Number, required: true },
  standingCapacity: { type: Number, default: 0 },

  owner: {
    name: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String },
    address: { type: String }
  },

  status: { 
    type: String, 
    enum: ['Active', 'In Maintenance', 'Inactive'], 
    default: 'Active' 
  },

  color: { type: String },
  vin: { type: String, unique: true, sparse: true }

}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
