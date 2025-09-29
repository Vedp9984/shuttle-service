const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const busStopSchema = new Schema({
  // Automatic _id generation serves as the unique ID for each bus stop

  stopName: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true // Ensures each stop has a unique name/identifier
  },
  
  // Geographical coordinates for mapping
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },

  // Address or detailed description
  address: { 
    type: String, 
    trim: true 
  },
  
  // Operational status
  isActive: { 
    type: Boolean, 
    default: true 
  },

}, { 
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('BusStop', busStopSchema);
