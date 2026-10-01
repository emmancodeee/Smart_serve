const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ''));
}

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: true
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  },
  lastLoginIp: {
    type: String,
    default: ''
  },
  // Security fields
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null }
});

adminSchema.pre('save', async function(next) {
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

adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (!isBcryptHash(this.password)) {
    return String(candidatePassword || '') === String(this.password || '');
  }

  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.hasHashedPassword = function() {
  return isBcryptHash(this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
