const mongoose = require('mongoose');

const ReturnRequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  
  // Related registration
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  
  // Items being returned
  items: [{
    type: {
      type: String,
      enum: ['module', 'uniform', 'books'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  
  // Return reason
  reason: {
    type: String,
    required: true,
    trim: true
  },
  
  // Additional details
  details: {
    type: String,
    default: ''
  },
  
  // Requested return date
  requestedReturnDate: {
    type: Date,
    required: true
  },
  
  // Actual return date
  actualReturnDate: {
    type: Date,
    default: null
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Admin decision
  adminDecision: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  
  // Return confirmation
  returnConfirmation: {
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    confirmedAt: {
      type: Date,
      default: null
    },
    receivedCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  
  // Inventory restoration status
  inventoryRestored: {
    type: Boolean,
    default: false
  },
  
  // Student feedback on return process
  studentFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comments: {
      type: String,
      default: ''
    }
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for common queries
ReturnRequestSchema.index({ userId: 1, createdAt: -1 });
ReturnRequestSchema.index({ status: 1, createdAt: -1 });
ReturnRequestSchema.index({ registrationId: 1 });
ReturnRequestSchema.index({ requestedReturnDate: 1, status: 1 });
ReturnRequestSchema.index({ priority: 1, status: 1 });

// Update timestamp on save
ReturnRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ReturnRequest', ReturnRequestSchema);