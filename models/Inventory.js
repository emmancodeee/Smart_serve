const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unitOfMeasure: {
    type: String,
    enum: ['pcs', 'sets', 'reams', 'copies', 'boxes', 'other'],
    default: 'pcs',
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  lastRestockedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Archival (soft archive - record retained, hidden from active list)
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
});

// Add indexes
inventorySchema.index({ category: 1 });
inventorySchema.index({ itemName: 1 });
inventorySchema.index({ quantity: 1, reorderLevel: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
