const { authenticateAdminRequest } = require('../services/authSupportService');

async function authenticateAdmin(req, res, next) {
  try {
    const { admin, decoded, error } = await authenticateAdminRequest(req);
    if (error) {
      return res.status(error.status).json(error.body);
    }

    req.admin = admin;
    req.auth = { admin, decoded };
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { authenticateAdmin };
