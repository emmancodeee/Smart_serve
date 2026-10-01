const adminReadService = require('./adminReadService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  return res.status(result.status || 200).json(result.body);
}

async function listUsers(req, res) {
  try {
    return sendResult(res, await adminReadService.listUsers(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listRegistrations(req, res) {
  try {
    return sendResult(res, await adminReadService.listRegistrations(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listPickupConfirmations(req, res) {
  try {
    return sendResult(res, await adminReadService.listPickupConfirmations(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getUserDetails(req, res) {
  try {
    return sendResult(res, await adminReadService.getUserDetails(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listUsers,
  listRegistrations,
  listPickupConfirmations,
  getUserDetails
};
