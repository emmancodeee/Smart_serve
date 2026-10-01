const returnRequestService = require('../services/returnRequestService');
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

// Student functions
async function createReturnRequest(req, res) {
  try {
    return sendResult(res, await returnRequestService.createReturnRequest(req));
  } catch (error) {
    logger.error('Create return request error', { error: error.message });
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Duplicate entry' });
    }
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function getUserReturnRequests(req, res) {
  try {
    return sendResult(res, await returnRequestService.getUserReturnRequests(req));
  } catch (error) {
    logger.error('Get user return requests error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function getReturnRequestById(req, res) {
  try {
    return sendResult(res, await returnRequestService.getReturnRequestById(req));
  } catch (error) {
    logger.error('Get return request by ID error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function cancelReturnRequest(req, res) {
  try {
    return sendResult(res, await returnRequestService.cancelReturnRequest(req));
  } catch (error) {
    logger.error('Cancel return request error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function addStudentFeedback(req, res) {
  try {
    return sendResult(res, await returnRequestService.addStudentFeedback(req));
  } catch (error) {
    logger.error('Add student feedback error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

// Admin functions
async function getAllReturnRequests(req, res) {
  try {
    return sendResult(res, await returnRequestService.getAllReturnRequests(req));
  } catch (error) {
    logger.error('Get all return requests error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function getReturnRequestDetails(req, res) {
  try {
    return sendResult(res, await returnRequestService.getReturnRequestDetails(req));
  } catch (error) {
    logger.error('Get return request details error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function approveReturnRequest(req, res) {
  try {
    return sendResult(res, await returnRequestService.approveReturnRequest(req));
  } catch (error) {
    logger.error('Approve return request error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function rejectReturnRequest(req, res) {
  try {
    return sendResult(res, await returnRequestService.rejectReturnRequest(req));
  } catch (error) {
    logger.error('Reject return request error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function confirmReturn(req, res) {
  try {
    return sendResult(res, await returnRequestService.confirmReturn(req));
  } catch (error) {
    logger.error('Confirm return error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function updateReturnRequestPriority(req, res) {
  try {
    return sendResult(res, await returnRequestService.updateReturnRequestPriority(req));
  } catch (error) {
    logger.error('Update return request priority error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

module.exports = {
  createReturnRequest,
  getUserReturnRequests,
  getReturnRequestById,
  cancelReturnRequest,
  addStudentFeedback,
  getAllReturnRequests,
  getReturnRequestDetails,
  approveReturnRequest,
  rejectReturnRequest,
  confirmReturn,
  updateReturnRequestPriority
};