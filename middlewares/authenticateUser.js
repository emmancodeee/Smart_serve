const { authenticateUserRequest } = require('../services/authSupportService');

async function authenticateUser(req, res, next) {
  try {
    const { user, decoded, error } = await authenticateUserRequest(req);
    if (error) {
      return res.status(error.status).json(error.body);
    }

    req.user = user;
    req.auth = { user, decoded };
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { authenticateUser };
