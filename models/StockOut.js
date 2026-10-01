const mongoose = require('mongoose');

const stockOutSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
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
  reason: {
    type: String,
    enum: ['Damaged', 'Expired', 'Disposed', 'Manual Adjustment'],
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  removedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
}, {
  timestamps: true,
});

stockOutSchema.index({ createdAt: -1 });
stockOutSchema.index({ inventoryId: 1 });

module.exports = mongoose.model('StockOut', stockOutSchema);