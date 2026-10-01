const Inventory = require('../models/Inventory');
const { resolveAuthenticatedAdmin } = require('./authSupportService');
const { cache, CACHE_KEYS } = require('./cacheService');

async function listInventory(req) {
  const { error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  // Try cache first
  const cached = cache.get(CACHE_KEYS.INVENTORY_LIST);
  if (cached) {
    return { body: cached, fromCache: true };
  }

  const inventory = await Inventory.find({ isArchived: { $ne: true } }).sort({ createdAt: -1 });
  
  // Cache for 5 minutes
  cache.set(CACHE_KEYS.INVENTORY_LIST, inventory);
  
  return { body: inventory };
}

async function getInventorySummary(req) {
  const { error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  // Try cache first
  const cached = cache.get(CACHE_KEYS.INVENTORY_SUMMARY);
  if (cached) {
    return { body: cached, fromCache: true };
  }

  const inventory = await Inventory.find({ isArchived: { $ne: true } });
  const stats = {
    totalItems: inventory.length,
    lowStockItems: inventory.filter(item => item.quantity <= item.reorderLevel).length,
    categories: {}
  };

  inventory.forEach(item => {
    if (!stats.categories[item.category]) {
      stats.categories[item.category] = 0;
    }
    stats.categories[item.category]++;
  });

  // Cache summary for 5 minutes
  cache.set(CACHE_KEYS.INVENTORY_SUMMARY, stats);

  return { body: stats };
}

module.exports = {
  listInventory,
  getInventorySummary
};