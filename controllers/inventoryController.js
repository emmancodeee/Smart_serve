const inventoryService = require('../services/inventoryService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  return res.status(result.status || 200).json(result.body);
}

async function listInventory(req, res) {
  try {
    return sendResult(res, await inventoryService.listInventory(req));
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function getInventorySummary(req, res) {
  try {
    return sendResult(res, await inventoryService.getInventorySummary(req));
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = {
  listInventory,
  getInventorySummary
};