const Inventory = require('../models/Inventory');
const Supply = require('../models/Supply');
const { sanitizeSupplyInput } = require('../utils/sanitize');
const { authenticateAdminRequest, logAdminTransaction } = require('./authSupportService');
const { cache, CACHE_KEYS } = require('./cacheService');

async function findInventoryItem(itemName, category) {
  const escapedName = String(itemName || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedCategory = String(category || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Inventory.findOne({
    itemName: { $regex: `^${escapedName}$`, $options: 'i' },
    category: { $regex: `^${escapedCategory}$`, $options: 'i' }
  });
}

async function addSupply(req) {
  const { admin, error } = await authenticateAdminRequest(req);
  if (error) return { error };

  const { sanitized, errors } = sanitizeSupplyInput(req.body || {});
  if (errors.length > 0) {
    return { error: { status: 400, body: { error: errors[0] } } };
  }

  const { itemName, category, quantity, notes } = sanitized;

  const existingItem = await findInventoryItem(itemName, category);
  let inventoryItem;
  if (existingItem) {
    inventoryItem = await Inventory.findByIdAndUpdate(
      existingItem._id,
      {
        $inc: { quantity },
        $set: { lastRestockedAt: new Date(), updatedAt: new Date() }
      },
      { new: true }
    );
  } else {
    inventoryItem = await new Inventory({
      itemName,
      category,
      quantity,
      unitOfMeasure: 'pcs',
      reorderLevel: 10,
      lastRestockedAt: new Date()
    }).save();
  }

  const supplyRecord = await new Supply({
    itemName,
    category,
    quantity,
    notes: notes || '',
    suppliedBy: admin._id
  }).save();

  cache.delByPrefix(CACHE_KEYS.INVENTORY_PREFIX);

  await logAdminTransaction(
    admin,
    'inventory_supplied',
    'supply',
    supplyRecord._id?.toString(),
    `${itemName} (${category}) +${quantity} supplied`
  );

  return { body: { message: 'Supply added successfully', item: inventoryItem, supply: supplyRecord } };
}

async function listSupply(req) {
  const { error } = await authenticateAdminRequest(req);
  if (error) return { error };

  const supplies = await Supply.find()
    .sort({ createdAt: -1 })
    .populate('suppliedBy', 'name email');

  return { body: supplies };
}

module.exports = {
  addSupply,
  listSupply
};