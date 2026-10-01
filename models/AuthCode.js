const mongoose = require('mongoose');

const authCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    purpose: {
      type: String,
      enum: ['verification', 'password_reset'],
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

authCodeSchema.index({ email: 1, purpose: 1 }, { unique: true });
authCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.AuthCode || mongoose.model('AuthCode', authCodeSchema);
