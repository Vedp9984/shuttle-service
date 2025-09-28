const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // Common fields
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phoneNumber: { type: String },
  
  // Role field to differentiate users
  role: {
    type: String,
    enum: ['User', 'Admin', 'Driver'],
    default: 'User'
  },

  // Driver-specific field
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'Driver'; }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
