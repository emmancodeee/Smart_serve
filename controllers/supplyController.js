const supplyService = require('../services/supplyService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  return res.status(result.status || 200).json(result.body);
}

async function addSupply(req, res) {
  try {
    return sendResult(res, await supplyService.addSupply(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function listSupply(req, res) {
  try {
    return sendResult(res, await supplyService.listSupply(req));
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = {
  addSupply,
  listSupply
};