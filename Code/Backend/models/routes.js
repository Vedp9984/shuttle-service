const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const routeSchema = new Schema({
  // Unique Identification and Management
  routeCode: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  routeName: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },

  // Stops
  originStop: { 
    type: Schema.Types.ObjectId, 
    ref: 'BusStop', 
    required: true 
  },
  originDepartureTime: { 
    type: String // 'HH:MM'
  },

  destinationStop: { 
    type: Schema.Types.ObjectId, 
    ref: 'BusStop', 
    required: true 
  },
  destinationArrivalTime: { 
    type: String // 'HH:MM'
  },

  // Intermediate Stops (order is implied by array position)
  stops: [{
    stop: { type: Schema.Types.ObjectId, ref: 'BusStop', required: true },
    arrivalTime: { type: String },   // optional, 'HH:MM'
    departureTime: { type: String }  // optional, 'HH:MM'
  }],



  // Scheduling Information
  daysAvailable: { 
    type: [String], 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  defaultDepartureTime: {
      type: String // fallback if individual times not set
  },

}, { 
  timestamps: true // createdAt and updatedAt
});

module.exports = mongoose.model('Route', routeSchema);
