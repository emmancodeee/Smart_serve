const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'adminModel',
    required: true,
    index: true
  },
  adminModel: {
    type: String,
    enum: ['Admin', 'User'],
    required: true,
    default: 'Admin'
  },
  adminName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    required: true,
    trim: true
  },
  entityId: {
    type: String,
    trim: true,
    default: ''
  },
  details: {
    type: String,
    trim: true,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
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

// TTL index: auto-purge transactions older than 1 year (31536000 seconds)
transactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Compound indexes for efficient querying
transactionSchema.index({ adminId: 1, createdAt: -1 });
transactionSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
