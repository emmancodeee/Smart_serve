const authService = require('../services/authService');
const logger = require('../utils/logger');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  return res.status(result.status || 200).json(result.body);
}

function isDatabaseUnavailableError(error) {
  if (!error) return false;

  const name = String(error.name || '').toLowerCase();
  const message = String(error.message || '').toLowerCase();

  return name.includes('mong') || name.includes('mongoose') || message.includes('server selection timed out') || message.includes('topology') || message.includes('connection') || message.includes('mongodb');
}

function isDuplicateKeyError(error) {
  if (!error) return false;
  return error.code === 11000 || (error.name === 'MongoError' && error.code === 11000) || (error.name === 'MongoServerError' && error.code === 11000);
}

async function sendVerificationCode(req, res) {
  try {
    return sendResult(res, await authService.sendVerificationCode(req.body));
  } catch (error) {
    logger.error('Verification error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Error processing verification code' });
  }
}

async function forgotPassword(req, res) {
  try {
    return sendResult(res, await authService.forgotPassword(req.body));
  } catch (error) {
    logger.error('Forgot password error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function extractOrf(req, res) {
  try {
    return sendResult(res, await authService.extractOrfData(req));
  } catch (error) {
    logger.error('ORF OCR extraction failed', { error: error.message, stack: error.stack });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Failed to extract ORF text' });
  }
}

async function resetPassword(req, res) {
  try {
    return sendResult(res, await authService.resetPassword(req.body));
  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function register(req, res) {
  try {
    return sendResult(res, await authService.registerUser(req.body));
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Email or student number already registered' });
    }
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function login(req, res) {
  try {
    return sendResult(res, await authService.loginAccount(req.body, req));
  } catch (error) {
    logger.error('Login error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function me(req, res) {
  try {
    return sendResult(res, await authService.getCurrentAccount(req));
  } catch (error) {
    logger.error('Get current account error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function updateProfile(req, res) {
  try {
    return sendResult(res, await authService.updateProfile(req));
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function changePassword(req, res) {
  try {
    return sendResult(res, await authService.changePassword(req));
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function verifySuperAdminAccess(req, res) {
  try {
    return sendResult(res, await authService.verifySuperAdminAccess(req));
  } catch (error) {
    logger.error('Verify super admin access error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

module.exports = {
  sendVerificationCode,
  forgotPassword,
  extractOrf,
  resetPassword,
  register,
  login,
  me,
  updateProfile,
  changePassword,
  verifySuperAdminAccess
};
