const feedbackService = require('../services/feedbackService');
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
async function createFeedback(req, res) {
  try {
    return sendResult(res, await feedbackService.createFeedback(req));
  } catch (error) {
    logger.error('Create feedback error', { error: error.message });
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Duplicate entry' });
    }
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function getUserFeedbacks(req, res) {
  try {
    return sendResult(res, await feedbackService.getUserFeedbacks(req));
  } catch (error) {
    logger.error('Get user feedbacks error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function getFeedbackById(req, res) {
  try {
    return sendResult(res, await feedbackService.getFeedbackById(req));
  } catch (error) {
    logger.error('Get feedback by ID error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function updateFeedback(req, res) {
  try {
    return sendResult(res, await feedbackService.updateFeedback(req));
  } catch (error) {
    logger.error('Update feedback error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function archiveFeedback(req, res) {
  try {
    return sendResult(res, await feedbackService.archiveFeedback(req));
  } catch (error) {
    logger.error('Archive feedback error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

// Admin functions
async function getAllFeedbacks(req, res) {
  try {
    return sendResult(res, await feedbackService.getAllFeedbacks(req));
  } catch (error) {
    logger.error('Get all feedbacks error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function getFeedbackDetails(req, res) {
  try {
    return sendResult(res, await feedbackService.getFeedbackDetails(req));
  } catch (error) {
    logger.error('Get feedback details error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function addAdminResponse(req, res) {
  try {
    return sendResult(res, await feedbackService.addAdminResponse(req));
  } catch (error) {
    logger.error('Add admin response error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function updateFeedbackStatus(req, res) {
  try {
    return sendResult(res, await feedbackService.updateFeedbackStatus(req));
  } catch (error) {
    logger.error('Update feedback status error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

async function updateFeedbackPriority(req, res) {
  try {
    return sendResult(res, await feedbackService.updateFeedbackPriority(req));
  } catch (error) {
    logger.error('Update feedback priority error', { error: error.message });
    const status = isDatabaseUnavailableError(error) ? 503 : 500;
    return res.status(status).json({ error: 'Server error' });
  }
}

module.exports = {
  createFeedback,
  getUserFeedbacks,
  getFeedbackById,
  updateFeedback,
  archiveFeedback,
  getAllFeedbacks,
  getFeedbackDetails,
  addAdminResponse,
  updateFeedbackStatus,
  updateFeedbackPriority
};