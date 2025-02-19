const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'call', 'message', 'app'],
    required: true
  },
  sourceApp: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  sourceDeviceId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  actionUrl: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster lookup
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, type: 1 });
NotificationSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);