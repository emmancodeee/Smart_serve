const Inventory = require('../models/Inventory');
const StockOut = require('../models/StockOut');
const { sanitizeStockOutInput } = require('../utils/sanitize');
const { authenticateAdminRequest, logAdminTransaction } = require('./authSupportService');
const { cache, CACHE_KEYS } = require('./cacheService');

async function removeStock(req) {
  const { admin, error } = await authenticateAdminRequest(req);
  if (error) return { error };

  const { sanitized, errors } = sanitizeStockOutInput(req.body || {});
  if (errors.length > 0) {
    return { error: { status: 400, body: { error: errors[0] } } };
  }

  const { inventoryId, quantity, reason, notes } = sanitized;

  const inventoryItem = await Inventory.findById(inventoryId);
  if (!inventoryItem) {
    return { error: { status: 404, body: { error: 'Inventory item not found' } } };
  }

  if (quantity > inventoryItem.quantity) {
    return {
      error: {
        status: 400,
        body: { error: `Insufficient stock. Only ${inventoryItem.quantity} ${inventoryItem.unitOfMeasure || 'pcs'} available.` }
      }
    };
  }

  const itemName = inventoryItem.itemName;
  const category = inventoryItem.category;

  const updatedItem = await Inventory.findByIdAndUpdate(
    inventoryId,
    { $inc: { quantity: -quantity }, $set: { updatedAt: new Date() } },
    { new: true }
  );

  const stockOutRecord = await new StockOut({
    inventoryId,
    itemName,
    category,
    quantity,
    reason,
    notes: notes || '',
    removedBy: admin._id
  }).save();

  cache.delByPrefix(CACHE_KEYS.INVENTORY_PREFIX);

  await logAdminTransaction(
    admin,
    'inventory_stocked_out',
    'stockout',
    stockOutRecord._id?.toString(),
    `${itemName} (${category}) -${quantity} removed, reason: ${reason}`
  );

  return { body: { message: 'Stock removed successfully', item: updatedItem, stockOut: stockOutRecord } };
}

async function listStockOut(req) {
  const { error } = await authenticateAdminRequest(req);
  if (error) return { error };

  const stockOuts = await StockOut.find()
    .sort({ createdAt: -1 })
    .populate('removedBy', 'name email');

  return { body: stockOuts };
}

module.exports = {
  removeStock,
  listStockOut
};