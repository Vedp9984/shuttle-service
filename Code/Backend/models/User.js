const mongoose = require('mongoose');

// Map to the existing "users" collection
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // we will hash new passwords
    firstName: String,
    lastName: String,
    phoneNumber: String
  },
  { collection: "users" }  // explicitly tell mongoose to use existing "users" collection
);

module.exports = mongoose.model('User', UserSchema);
