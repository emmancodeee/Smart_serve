const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Separate name fields
  firstName: { type: String, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  
  // Legacy field - kept for backward compatibility
  fullname: { type: String, trim: true },
  
  yearLevel: { type: String, trim: true },
  studentType: { type: String, trim: true },
  module: { type: String, trim: true },
  moduleCode: { type: String, trim: true },
  uniformType: { type: String, trim: true },
  books: { type: String, trim: true },
  course: { type: String, trim: true },

  pictureOfId: { type: String }, // store path like "/uploads/abc.png"
  
  // Request Management Fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  // Pickup Information
  pickupNumber: { type: String, unique: true, sparse: true }, // Format: UP-001, UP-002, etc.
  pickupDate: { type: Date },
  pickupStatus: {
    type: String,
    enum: ['pending', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Feedback & Return Process
  feedback: { type: String, default: '' },
  returnDate: { type: Date },
  returnStatus: {
    type: String,
    enum: ['pending', 'returned', 'damaged', 'lost'],
    default: 'pending'
  },
  returnFeedback: { type: String, default: '' },
  
  // Link to formal return requests
  returnRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReturnRequest',
    default: null
  },
  hasActiveReturnRequest: {
    type: Boolean,
    default: false
  },
  
  // Approval Process
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  
  // Archival (soft archive - record retained, hidden from active list)
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: { type: Date, default: null },
  
}, { timestamps: true });

// Index for common queries
RegistrationSchema.index({ status: 1, createdAt: -1 });
RegistrationSchema.index({ module: 1, status: 1 });
RegistrationSchema.index({ userId: 1 });

module.exports = mongoose.model('Registration', RegistrationSchema);
