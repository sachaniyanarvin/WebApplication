const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'laptop', 'desktop', 'tablet', 'other'],
    required: true
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  pushToken: {
    type: String,
    default: null
  },
  isConnected: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster lookup
DeviceSchema.index({ user: 1, deviceType: 1 });
DeviceSchema.index({ deviceId: 1 }, { unique: true });

module.exports = mongoose.model('Device', DeviceSchema);