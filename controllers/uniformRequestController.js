const uniformRequestService = require('../services/uniformRequestService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }
  return res.status(result.status || 200).json(result.body);
}

async function listRequests(req, res) {
  try {
    return sendResult(res, await uniformRequestService.listRequests(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function approveRequest(req, res) {
  try {
    return sendResult(res, await uniformRequestService.approveRequest(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function rejectRequest(req, res) {
  try {
    return sendResult(res, await uniformRequestService.rejectRequest(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function bulkApproveRequests(req, res) {
  try {
    return sendResult(res, await uniformRequestService.bulkApproveRequests(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function updateFeedback(req, res) {
  try {
    return sendResult(res, await uniformRequestService.updateFeedback(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function initiateReturn(req, res) {
  try {
    return sendResult(res, await uniformRequestService.initiateReturn(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

async function completeReturn(req, res) {
  try {
    return sendResult(res, await uniformRequestService.completeReturn(req));
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

module.exports = {
  listRequests,
  approveRequest,
  rejectRequest,
  bulkApproveRequests,
  updateFeedback,
  initiateReturn,
  completeReturn
};
