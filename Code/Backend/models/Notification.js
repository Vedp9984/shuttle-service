// models/Notification.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  recipientId: { type: Schema.Types.ObjectId }, // userId, driverId, adminId, or null for broadcast
  recipientType: { type: String, enum: ['User','Driver','Admin','All'], default: 'User' },
  type: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', NotificationSchema);
