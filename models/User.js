const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ''));
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  firstName: { type: String, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  birthday: { type: Date },
  age: { type: Number },
  studentNumber: { type: String, unique: true, sparse: true },

  isAdmin: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active'],
    default: 'pending',
    index: true
  },
  
  // Soft delete fields
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  deletionReason: { type: String, default: '', trim: true },
  
  // Security fields
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  lastLoginIp: { type: String, default: '' }
}, { timestamps: true });

// Compound index for common queries filtering soft-deleted users
UserSchema.index({ isDeleted: 1, status: 1 });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!isBcryptHash(this.password)) {
    return String(candidatePassword || '') === String(this.password || '');
  }

  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.hasHashedPassword = function() {
  return isBcryptHash(this.password);
};

module.exports = mongoose.model('User', UserSchema);
