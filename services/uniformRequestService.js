const Registration = require('../models/Registration');
const { sanitizeInventoryInput } = require('../utils/sanitize');
const { resolveAuthenticatedAdmin, isSuperAdminAccount, logAdminTransaction } = require('./authSupportService');

/**
 * Generate unique pickup number in format: UP-XXX
 * UP = Uniform Pickup
 */
async function generatePickupNumber() {
  const latestRecord = await Registration.findOne({ pickupNumber: { $exists: true, $ne: null } })
    .sort({ createdAt: -1 })
    .select('pickupNumber');
  
  let nextNum = 1;
  if (latestRecord && latestRecord.pickupNumber) {
    const match = latestRecord.pickupNumber.match(/UP-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1]) + 1;
    }
  }
  
  return `UP-${String(nextNum).padStart(3, '0')}`;
}

async function listRequests(req) {
  const { error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const { status, module, page = 1, limit = 20 } = req.query;
  const query = {};
  
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query.status = status;
  }
  
  if (module) {
    query.module = module;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const requests = await Registration.find(query)
    .populate('userId', 'name email studentNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Registration.countDocuments(query);

  return {
    body: {
      requests: requests.map(req => formatRequestResponse(req)),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    }
  };
}

async function approveRequest(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const { id } = req.params;
  const registration = await Registration.findById(id);
  
  if (!registration) {
    return { error: { status: 404, body: { error: 'Request not found' } } };
  }

  const pickupNumber = await generatePickupNumber();
  
  const updated = await Registration.findByIdAndUpdate(
    id,
    {
      $set: {
        status: 'approved',
        pickupNumber,
        pickupStatus: 'ready',
        approvedBy: admin._id,
        approvedAt: new Date(),
        updatedAt: new Date()
      }
    },
    { new: true }
  ).populate('userId', 'name email');

  await logAdminTransaction(admin, 'request_approved', 'registration', id, `Request approved - Pickup Number: ${pickupNumber}`);

  return { body: { message: 'Request approved successfully', request: formatRequestResponse(updated) } };
}

async function rejectRequest(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const { id } = req.params;
  const { reason = '' } = req.body;

  const registration = await Registration.findById(id);
  
  if (!registration) {
    return { error: { status: 404, body: { error: 'Request not found' } } };
  }

  const updated = await Registration.findByIdAndUpdate(
    id,
    {
      $set: {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date()
      }
    },
    { new: true }
  ).populate('userId', 'name email');

  await logAdminTransaction(admin, 'request_rejected', 'registration', id, `Request rejected - Reason: ${reason}`);

  return { body: { message: 'Request rejected successfully', request: formatRequestResponse(updated) } };
}

async function bulkApproveRequests(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin cannot perform bulk operations' } } };
  }

  const { ids = [] } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return { error: { status: 400, body: { error: 'Invalid or empty request IDs' } } };
  }

  const results = { approved: 0, failed: 0, errors: [] };

  for (const id of ids) {
    try {
      const registration = await Registration.findById(id);
      if (!registration) {
        results.failed++;
        results.errors.push({ id, error: 'Not found' });
        continue;
      }

      const pickupNumber = await generatePickupNumber();
      
      await Registration.findByIdAndUpdate(
        id,
        {
          $set: {
            status: 'approved',
            pickupNumber,
            pickupStatus: 'ready',
            approvedBy: admin._id,
            approvedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      results.approved++;
      await logAdminTransaction(admin, 'request_bulk_approved', 'registration', id, `Bulk approval - Pickup: ${pickupNumber}`);
    } catch (err) {
      results.failed++;
      results.errors.push({ id, error: err.message });
    }
  }

  return {
    body: {
      message: `Bulk approval completed: ${results.approved} approved, ${results.failed} failed`,
      results
    }
  };
}

async function updateFeedback(req) {
  const { id } = req.params;
  const { feedback } = req.body;

  const registration = await Registration.findById(id);
  
  if (!registration) {
    return { error: { status: 404, body: { error: 'Request not found' } } };
  }

  const updated = await Registration.findByIdAndUpdate(
    id,
    {
      $set: {
        feedback: feedback || '',
        updatedAt: new Date()
      }
    },
    { new: true }
  );

  return { body: { message: 'Feedback added successfully', request: formatRequestResponse(updated) } };
}

async function initiateReturn(req) {
  const { id } = req.params;
  const { feedback = '' } = req.body;

  const registration = await Registration.findById(id);
  
  if (!registration) {
    return { error: { status: 404, body: { error: 'Request not found' } } };
  }

  const updated = await Registration.findByIdAndUpdate(
    id,
    {
      $set: {
        returnDate: new Date(),
        returnStatus: 'pending',
        returnFeedback: feedback,
        updatedAt: new Date()
      }
    },
    { new: true }
  );

  return { body: { message: 'Return process initiated', request: formatRequestResponse(updated) } };
}

async function completeReturn(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const { id } = req.params;
  const { returnStatus = 'returned', feedback = '' } = req.body;

  if (!['returned', 'damaged', 'lost'].includes(returnStatus)) {
    return { error: { status: 400, body: { error: 'Invalid return status' } } };
  }

  const registration = await Registration.findById(id);
  
  if (!registration) {
    return { error: { status: 404, body: { error: 'Request not found' } } };
  }

  const updated = await Registration.findByIdAndUpdate(
    id,
    {
      $set: {
        returnStatus,
        returnFeedback: feedback,
        updatedAt: new Date()
      }
    },
    { new: true }
  ).populate('userId', 'name email');

  await logAdminTransaction(admin, 'return_completed', 'registration', id, `Return completed - Status: ${returnStatus}`);

  return { body: { message: 'Return completed successfully', request: formatRequestResponse(updated) } };
}

function formatRequestResponse(registration) {
  if (!registration) return null;
  
  return {
    id: registration._id,
    firstName: registration.firstName,
    middleName: registration.middleName,
    lastName: registration.lastName,
    module: registration.module,
    moduleCode: registration.moduleCode,
    uniformType: registration.uniformType,
    course: registration.course,
    status: registration.status,
    pickupNumber: registration.pickupNumber,
    pickupDate: registration.pickupDate,
    pickupStatus: registration.pickupStatus,
    feedback: registration.feedback,
    returnDate: registration.returnDate,
    returnStatus: registration.returnStatus,
    returnFeedback: registration.returnFeedback,
    approvedBy: registration.approvedBy,
    approvedAt: registration.approvedAt,
    rejectionReason: registration.rejectionReason,
    userId: registration.userId,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt
  };
}

module.exports = {
  generatePickupNumber,
  listRequests,
  approveRequest,
  rejectRequest,
  bulkApproveRequests,
  updateFeedback,
  initiateReturn,
  completeReturn,
  formatRequestResponse
};
