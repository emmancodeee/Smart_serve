const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  notes: {
    type: String,
    default: '',
  },
  suppliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
}, {
  timestamps: true,
});

supplySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Supply', supplySchema);