const adminService = require('../services/adminService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  return res.status(result.status || 200).json(result.body);
}

function isDuplicateKeyError(error) {
  if (!error) return false;
  return error.code === 11000 || (error.name === 'MongoError' && error.code === 11000) || (error.name === 'MongoServerError' && error.code === 11000);
}

async function listUsers(req, res) {
  try {
    return sendResult(res, await adminService.listUsers(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createAdmin(req, res) {
  try {
    return sendResult(res, await adminService.createAdmin(req));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

async function changeOwnPassword(req, res) {
  try {
    return sendResult(res, await adminService.changeOwnPassword(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listAdmins(req, res) {
  try {
    return sendResult(res, await adminService.listAdmins(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteAdmin(req, res) {
  try {
    return sendResult(res, await adminService.deleteAdmin(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listRegistrations(req, res) {
  try {
    return sendResult(res, await adminService.listRegistrations(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listTransactions(req, res) {
  try {
    return sendResult(res, await adminService.listTransactions(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listPickupNotifications(req, res) {
  try {
    return sendResult(res, await adminService.listPickupNotifications(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listPickupConfirmations(req, res) {
  try {
    return sendResult(res, await adminService.listPickupConfirmations(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function applyPickupConfirmation(req, res) {
  try {
    return sendResult(res, await adminService.applyPickupConfirmation(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateRegistrationStatus(req, res) {
  try {
    return sendResult(res, await adminService.updateRegistrationStatus(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function archiveRegistration(req, res) {
  try {
    return sendResult(res, await adminService.archiveRegistration(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getUserDetails(req, res) {
  try {
    return sendResult(res, await adminService.getUserDetails(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    return sendResult(res, await adminService.deleteUser(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listUsers,
  createAdmin,
  changeOwnPassword,
  listAdmins,
  deleteAdmin,
  listRegistrations,
  listTransactions,
  listPickupNotifications,
  listPickupConfirmations,
  applyPickupConfirmation,
  updateRegistrationStatus,
  archiveRegistration,
  getUserDetails,
  deleteUser
};
