const stockOutService = require('../services/stockOutService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  return res.status(result.status || 200).json(result.body);
}

async function removeStock(req, res) {
  try {
    return sendResult(res, await stockOutService.removeStock(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function listStockOut(req, res) {
  try {
    return sendResult(res, await stockOutService.listStockOut(req));
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = {
  removeStock,
  listStockOut
};