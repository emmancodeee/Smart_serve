const Inventory = require('../models/Inventory');

function splitRegistrationItems(value) {
  return String(value || '')
    .split(';')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeInventoryKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildRequestedSupplies(registration) {
  const requests = [];

  splitRegistrationItems(registration?.module).forEach(item => {
    requests.push({ category: 'Modules', requestedLabel: item, quantity: 1 });
  });

  splitRegistrationItems(registration?.books).forEach(item => {
    requests.push({ category: 'Books', requestedLabel: item, quantity: 1 });
  });

  const uniformType = String(registration?.uniformType || '').trim();
  if (uniformType) {
    requests.push({ category: 'Uniforms', requestedLabel: uniformType, quantity: 1 });
  }

  return requests;
}

function findInventoryMatch(request, inventoryItems, usedInventoryIds) {
  const requestedKey = normalizeInventoryKey(request.requestedLabel);
  const requestedPrimaryKey = normalizeInventoryKey(
    String(request.requestedLabel || '')
      .split(/\s+-\s+|\s+\/\s+/)[0]
      .trim()
  );

  return inventoryItems.find(item => {
    if (String(item.category || '') !== request.category) return false;
    if (usedInventoryIds.has(String(item._id))) return false;

    const itemKey = normalizeInventoryKey(item.itemName);
    if (!itemKey) return false;

    return (
      itemKey === requestedKey ||
      itemKey === requestedPrimaryKey ||
      requestedKey.includes(itemKey) ||
      itemKey.includes(requestedKey) ||
      (requestedPrimaryKey && itemKey.includes(requestedPrimaryKey))
    );
  });
}

async function allocateInventoryForRegistration(registration) {
  const requests = buildRequestedSupplies(registration);
  if (!requests.length) {
    return { allocations: [], requestedItems: [] };
  }

  const inventoryItems = await Inventory.find({
    category: { $in: ['Modules', 'Books', 'Uniforms'] }
  }).sort({ itemName: 1 });

  const allocations = [];
  const requestedItems = [];
  const usedInventoryIds = new Set();

  for (const request of requests) {
    requestedItems.push(`${request.category}: ${request.requestedLabel}`);
    const match = findInventoryMatch(request, inventoryItems, usedInventoryIds);

    if (!match) {
      return {
        error: {
          status: 400,
          body: { error: `No inventory match found for ${request.category}: ${request.requestedLabel}` }
        }
      };
    }

    if (Number(match.quantity) < Number(request.quantity)) {
      return {
        error: {
          status: 400,
          body: { error: `Insufficient stock for ${match.itemName}. Available: ${match.quantity}, required: ${request.quantity}` }
        }
      };
    }

    match.quantity -= Number(request.quantity);
    usedInventoryIds.add(String(match._id));
    allocations.push({
      inventoryId: match._id,
      itemName: match.itemName,
      category: match.category,
      requestedLabel: request.requestedLabel,
      quantity: Number(request.quantity)
    });
  }

  for (const item of inventoryItems) {
    if (item.isModified('quantity')) {
      item.updatedAt = new Date();
      await item.save();
    }
  }

  return { allocations, requestedItems };
}

async function restoreInventoryAllocations(allocations) {
  for (const allocation of allocations || []) {
    if (!allocation?.inventoryId) continue;

    const item = await Inventory.findById(allocation.inventoryId);
    if (!item) continue;

    item.quantity = Number(item.quantity || 0) + Number(allocation.quantity || 0);
    item.updatedAt = new Date();
    await item.save();
  }
}

module.exports = {
  allocateInventoryForRegistration,
  restoreInventoryAllocations
};
