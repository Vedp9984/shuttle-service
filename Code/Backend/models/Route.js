// models/Route.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const RouteSchema = new Schema({
  routeName: { type: String, required: true },
  description: String,
  origin: String,
  destination: String,
  basePrice: { type: Number, default: 0.0 },
  stops: [{ type: Schema.Types.ObjectId, ref: 'BusStop' }]
});

module.exports = mongoose.model('Route', RouteSchema);
