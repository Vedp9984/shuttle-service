const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const routeSchema = new Schema({
  routeName: { type: String, required: true },
  description: { type: String },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  basePrice: { type: Number, required: true },
  stops: [{ type: Schema.Types.ObjectId, ref: 'BusStop' }],
});

module.exports = mongoose.model('Route', routeSchema);
