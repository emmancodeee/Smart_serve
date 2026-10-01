const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
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
  
  // Type of feedback
  category: {
    type: String,
    enum: ['module', 'uniform', 'books', 'general', 'service'],
    required: true
  },
  
  // Subject/topic
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  // Detailed feedback content
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Related IDs (if feedback is about specific item)
  relatedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedItemType: {
    type: String,
    enum: ['registration', 'schedule', 'inventory', null],
    default: null
  },
  
  // Admin responses
  adminResponses: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    adminName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'closed'],
    default: 'pending'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Admin who reviewed/resolved
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  
  // Resolution notes
  resolutionNotes: {
    type: String,
    default: ''
  },

  // Archival (soft archive - record retained, hidden from active list)
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
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
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ category: 1, status: 1 });
FeedbackSchema.index({ priority: 1, status: 1 });

// Update timestamp on save
FeedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Feedback', FeedbackSchema);