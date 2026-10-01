const ReturnRequest = require('../models/ReturnRequest');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sanitizeString } = require('../utils/sanitize');
const { restoreInventoryAllocations } = require('./registrationInventoryService');
const { sendReturnConfirmed } = require('./emailNotificationService');
const logger = require('../utils/logger');
const { returnRequestMachine } = require('./stateMachineService');

async function createReturnRequest(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const user = await User.findById(userId);
  if (!user || user.isAdmin) {
    return { error: { status: 404, body: { error: 'User not found' } } };
  }

  const registrationId = req.body?.registrationId;
  if (!registrationId) {
    return { error: { status: 400, body: { error: 'Registration ID is required' } } };
  }

  const registration = await Registration.findById(registrationId);
  if (!registration) {
    return { error: { status: 404, body: { error: 'Registration not found' } } };
  }

  // Check if registration belongs to user
  if (String(registration.userId) !== String(userId)) {
    return { error: { status: 403, body: { error: 'Access denied' } } };
  }

  // Check if registration is approved
  if (registration.status !== 'approved') {
    return { error: { status: 400, body: { error: 'Can only return items from approved registrations' } } };
  }

  // Check if there's already an active return request
  if (registration.hasActiveReturnRequest) {
    return { error: { status: 400, body: { error: 'An active return request already exists for this registration' } } };
  }

  const items = req.body?.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    return { error: { status: 400, body: { error: 'At least one item must be specified for return' } } };
  }

  // Validate items
  const validTypes = ['module', 'uniform', 'books'];
  const validConditions = ['excellent', 'good', 'fair', 'poor', 'damaged'];
  
  for (const item of items) {
    if (!validTypes.includes(item.type)) {
      return { error: { status: 400, body: { error: 'Invalid item type' } } };
    }
    if (!item.name || item.name.trim().length === 0) {
      return { error: { status: 400, body: { error: 'Item name is required' } } };
    }
    if (!validConditions.includes(item.condition)) {
      return { error: { status: 400, body: { error: 'Invalid item condition' } } };
    }
  }

  const reason = sanitizeString(req.body?.reason || '');
  if (!reason || reason.length < 10) {
    return { error: { status: 400, body: { error: 'Reason must be at least 10 characters' } } };
  }

  const details = sanitizeString(req.body?.details || '');
  const requestedReturnDate = new Date(req.body?.requestedReturnDate);
  
  if (!requestedReturnDate || isNaN(requestedReturnDate.getTime())) {
    return { error: { status: 400, body: { error: 'Valid return date is required' } } };
  }

  const priority = String(req.body?.priority || 'medium').toLowerCase();
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return { error: { status: 400, body: { error: 'Invalid priority level' } } };
  }

  const returnRequest = new ReturnRequest({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    registrationId,
    items,
    reason,
    details,
    requestedReturnDate,
    priority,
    status: 'pending'
  });

  await returnRequest.save();

  // Update registration to flag active return request
  registration.hasActiveReturnRequest = true;
  registration.returnRequestId = returnRequest._id;
  await registration.save();

  logger.auth('return_request_created', userId.toString(), { 
    registrationId: registrationId.toString(),
    itemCount: items.length,
    priority 
  });

  return {
    status: 201,
    body: {
      message: 'Return request submitted successfully',
      returnRequest: {
        _id: returnRequest._id,
        registrationId: returnRequest.registrationId,
        items: returnRequest.items,
        requestedReturnDate: returnRequest.requestedReturnDate,
        status: returnRequest.status,
        priority: returnRequest.priority,
        createdAt: returnRequest.createdAt
      }
    }
  };
}

async function getUserReturnRequests(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequests = await ReturnRequest.find({ userId })
    .populate('registrationId', 'module uniformType books course')
    .sort({ createdAt: -1 })
    .lean();

  return { body: returnRequests };
}

async function getReturnRequestById(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequest = await ReturnRequest.findById(req.params.id)
    .populate('registrationId', 'module uniformType books course')
    .lean();

  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  // Check if user owns this return request
  if (String(returnRequest.userId) !== String(userId)) {
    return { error: { status: 403, body: { error: 'Access denied' } } };
  }

  return { body: returnRequest };
}

async function cancelReturnRequest(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequest = await ReturnRequest.findById(req.params.id);
  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  // Check if user owns this return request
  if (String(returnRequest.userId) !== String(userId)) {
    return { error: { status: 403, body: { error: 'Access denied' } } };
  }

  // Use state machine to validate transition
  const transitionResult = await returnRequestMachine.transition(
    returnRequest,
    'cancelled',
    { userId }
  );

  if (!transitionResult.success) {
    return { error: { status: 400, body: { error: transitionResult.error } } };
  }

  await returnRequest.save();

  // Update registration
  const registration = await Registration.findById(returnRequest.registrationId);
  if (registration) {
    registration.hasActiveReturnRequest = false;
    registration.returnRequestId = null;
    await registration.save();
  }

  logger.auth('return_request_cancelled', userId.toString(), { 
    returnRequestId: returnRequest._id.toString() 
  });

  return { body: { message: 'Return request cancelled successfully' } };
}

async function addStudentFeedback(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequest = await ReturnRequest.findById(req.params.id);
  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  // Check if user owns this return request
  if (String(returnRequest.userId) !== String(userId)) {
    return { error: { status: 403, body: { error: 'Access denied' } } };
  }

  // Only allow feedback if return is completed
  if (returnRequest.status !== 'completed') {
    return { error: { status: 400, body: { error: 'Can only add feedback for completed returns' } } };
  }

  const rating = Number(req.body?.rating) || null;
  const comments = sanitizeString(req.body?.comments || '');

  if (rating !== null && (rating < 1 || rating > 5)) {
    return { error: { status: 400, body: { error: 'Rating must be between 1 and 5' } } };
  }

  if (comments && comments.length < 5) {
    return { error: { status: 400, body: { error: 'Comments must be at least 5 characters' } } };
  }

  returnRequest.studentFeedback = {
    rating,
    comments
  };

  await returnRequest.save();

  logger.auth('return_feedback_added', userId.toString(), { 
    returnRequestId: returnRequest._id.toString(),
    rating 
  });

  return {
    body: {
      message: 'Feedback added successfully',
      returnRequest
    }
  };
}

// Admin functions
async function getAllReturnRequests(req) {
  const { status, priority, page = 1, limit = 20 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);
  
  const returnRequests = await ReturnRequest.find(filter)
    .populate('registrationId', 'module uniformType books course')
    .populate('userId', 'name email')
    .sort({ priority: -1, requestedReturnDate: 1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await ReturnRequest.countDocuments(filter);

  return {
    body: {
      returnRequests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  };
}

async function getReturnRequestDetails(req) {
  const returnRequest = await ReturnRequest.findById(req.params.id)
    .populate('registrationId', 'module uniformType books course')
    .populate('userId', 'name email')
    .lean();

  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  return { body: returnRequest };
}

async function approveReturnRequest(req) {
  const adminId = req.admin?._id || req.auth?.admin?._id || req.auth?.decoded?.id;
  if (!adminId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequest = await ReturnRequest.findById(req.params.id);
  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  const adminNotes = sanitizeString(req.body?.adminNotes || '');

  // Use state machine to validate and execute transition
  const transitionResult = await returnRequestMachine.transition(
    returnRequest,
    'approved',
    { adminId, adminNotes }
  );

  if (!transitionResult.success) {
    return { error: { status: 400, body: { error: transitionResult.error } } };
  }

  await returnRequest.save();

  logger.auth('return_request_approved', adminId.toString(), { 
    returnRequestId: returnRequest._id.toString() 
  });

  return {
    body: {
      message: 'Return request approved successfully',
      returnRequest
    }
  };
}

async function rejectReturnRequest(req) {
  const adminId = req.admin?._id || req.auth?.admin?._id || req.auth?.decoded?.id;
  if (!adminId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequest = await ReturnRequest.findById(req.params.id);
  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  const rejectionReason = sanitizeString(req.body?.rejectionReason || '');
  if (!rejectionReason || rejectionReason.length < 10) {
    return { error: { status: 400, body: { error: 'Rejection reason must be at least 10 characters' } } };
  }

  const adminNotes = sanitizeString(req.body?.adminNotes || '');

  // Use state machine to validate and execute transition
  const transitionResult = await returnRequestMachine.transition(
    returnRequest,
    'rejected',
    { adminId, rejectionReason, adminNotes }
  );

  if (!transitionResult.success) {
    return { error: { status: 400, body: { error: transitionResult.error } } };
  }

  await returnRequest.save();

  // Update registration
  const registration = await Registration.findById(returnRequest.registrationId);
  if (registration) {
    registration.hasActiveReturnRequest = false;
    registration.returnRequestId = null;
    await registration.save();
  }

  logger.auth('return_request_rejected', adminId.toString(), { 
    returnRequestId: returnRequest._id.toString() 
  });

  return {
    body: {
      message: 'Return request rejected successfully',
      returnRequest
    }
  };
}

async function confirmReturn(req) {
  const adminId = req.admin?._id || req.auth?.admin?._id || req.auth?.decoded?.id;
  if (!adminId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequest = await ReturnRequest.findById(req.params.id);
  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  const receivedCondition = String(req.body?.receivedCondition || '').toLowerCase();
  const notes = sanitizeString(req.body?.notes || '');

  // Use state machine to validate and execute transition
  const transitionResult = await returnRequestMachine.transition(
    returnRequest,
    'completed',
    { adminId, receivedCondition, notes }
  );

  if (!transitionResult.success) {
    return { error: { status: 400, body: { error: transitionResult.error } } };
  }

  // The state machine reports completed -> completed as a successful no-op
  // ("unchanged"), which let a repeated confirm fall through to the inventory
  // restore and the email below a second time.
  if (transitionResult.unchanged) {
    return { error: { status: 409, body: { error: 'This return has already been confirmed.' } } };
  }

  returnRequest.actualReturnDate = new Date();

  // Two confirms sent at the same moment (a double click, or two admins) both
  // load the request while it is still 'approved', so the check above cannot
  // tell them apart. Only the request whose conditional update flips the
  // stored status from 'approved' goes on to restore inventory; the other
  // gets the same 409.
  const claim = await ReturnRequest.updateOne(
    { _id: returnRequest._id, status: 'approved' },
    {
      $set: {
        status: 'completed',
        actualReturnDate: returnRequest.actualReturnDate,
        returnConfirmation: returnRequest.toObject().returnConfirmation
      }
    }
  );
  if (!claim.matchedCount) {
    return { error: { status: 409, body: { error: 'This return has already been confirmed.' } } };
  }

  await returnRequest.save();

  // Restore inventory allocations
  try {
    const registration = await Registration.findById(returnRequest.registrationId);
    if (registration && registration.inventoryAllocations && registration.inventoryAllocations.length > 0) {
      await restoreInventoryAllocations(registration.inventoryAllocations);
      returnRequest.inventoryRestored = true;
      await returnRequest.save();
      
      // Update registration
      registration.returnStatus = 'returned';
      registration.returnDate = new Date();
      registration.hasActiveReturnRequest = false;
      await registration.save();
    }
  } catch (error) {
    logger.error('Failed to restore inventory allocations', { 
      error: error.message,
      returnRequestId: returnRequest._id.toString() 
    });
  }

  logger.auth('return_confirmed', adminId.toString(), { 
    returnRequestId: returnRequest._id.toString(),
    receivedCondition 
  });

  // Fire-and-forget email notification for return confirmation
  sendReturnConfirmed({
    email: returnRequest.userEmail,
    name: returnRequest.userName || 'Student',
    items: returnRequest.items || []
  }).catch(err => logger.error('Failed to send return confirmation email', { error: err.message }));

  return {
    body: {
      message: 'Return confirmed successfully',
      returnRequest
    }
  };
}

async function updateReturnRequestPriority(req) {
  const adminId = req.admin?._id || req.auth?.admin?._id || req.auth?.decoded?.id;
  if (!adminId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const returnRequest = await ReturnRequest.findById(req.params.id);
  if (!returnRequest) {
    return { error: { status: 404, body: { error: 'Return request not found' } } };
  }

  const priority = String(req.body?.priority || 'medium').toLowerCase();
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  
  if (!validPriorities.includes(priority)) {
    return { error: { status: 400, body: { error: 'Invalid priority' } } };
  }

  returnRequest.priority = priority;
  await returnRequest.save();

  logger.auth('return_priority_updated', adminId.toString(), { 
    returnRequestId: returnRequest._id.toString(),
    priority 
  });

  return {
    body: {
      message: 'Return request priority updated successfully',
      returnRequest
    }
  };
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