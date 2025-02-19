const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mobileDevice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  computerDevice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookup and automatic expiration
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Session', SessionSchema);