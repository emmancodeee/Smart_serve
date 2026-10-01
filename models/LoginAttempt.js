const mongoose = require('mongoose');

const LoginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  successful: {
    type: Boolean,
    required: true,
    default: false
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// TTL index: auto-purge login attempts older than 24 hours (86400 seconds)
LoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Compound index for rate limiting queries
LoginAttemptSchema.index({ email: 1, createdAt: -1 });
LoginAttemptSchema.index({ ipAddress: 1, createdAt: -1 });

module.exports = mongoose.model('LoginAttempt', LoginAttemptSchema);

