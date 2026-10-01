const analyticsService = require('../services/analyticsService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }
  return res.status(result.status || 200).json(result.body);
}

async function getRegistrationFunnel(req, res) {
  try {
    return sendResult(res, await analyticsService.getRegistrationFunnel(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getInventoryAnalytics(req, res) {
  try {
    return sendResult(res, await analyticsService.getInventoryAnalytics(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getNoShowAnalytics(req, res) {
  try {
    return sendResult(res, await analyticsService.getNoShowAnalytics(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getDashboardAnalytics(req, res) {
  try {
    return sendResult(res, await analyticsService.getDashboardAnalytics(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getRegistrationFunnel,
  getInventoryAnalytics,
  getNoShowAnalytics,
  getDashboardAnalytics
};

