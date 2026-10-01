const User = require('../models/User');
const Admin = require('../models/Admin');
const Registration = require('../models/Registration');
const Transaction = require('../models/Transaction');
const Schedule = require('../models/Schedule');
const { sanitizeEmail, validateEmail, sanitizeString, validatePassword, validateName } = require('../utils/sanitize');
const {
  buildAutoScheduleForApprovedRegistration,
  countDailyLoadsFromSchedules
} = require('../utils/scheduler');
const {
  resolveAuthenticatedAdmin,
  isSuperAdminAccount,
  logAdminTransaction
} = require('./authSupportService');
const {
  allocateInventoryForRegistration,
  restoreInventoryAllocations
} = require('./registrationInventoryService');
const {
  sendRegistrationApproved,
  sendRegistrationRejected
} = require('./emailNotificationService');
const { registrationMachine } = require('./stateMachineService');
const logger = require('../utils/logger');
const { cache, CACHE_KEYS } = require('./cacheService');

async function listUsers(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }
  // Exclude soft-deleted users and admins
  const users = await User.find({ isAdmin: { $ne: true }, isDeleted: { $ne: true } }).select('-password');
  return { body: users };
}

async function createAdmin(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (!isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access required to create admin accounts.' } } };
  }

  const name = sanitizeString(req.body?.name || '');
  const email = sanitizeEmail(req.body?.email || '');
  const password = String(req.body?.password || '');

  if (!name || !validateName(name)) {
    return { error: { status: 400, body: { error: 'Name must be 2-100 characters and contain only letters, spaces, hyphens, or apostrophes' } } };
  }
  if (!email || !validateEmail(email)) {
    return { error: { status: 400, body: { error: 'Invalid email format' } } };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { error: { status: 400, body: { error: passwordValidation.message } } };
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return { error: { status: 409, body: { error: 'An admin account with that email already exists.' } } };
  }

  const existingUser = await User.findOne({ email }).select('_id');
  if (existingUser) {
    return { error: { status: 409, body: { error: 'A user account with that email already exists.' } } };
  }

  const newAdmin = new Admin({ name, email, password, isAdmin: true, isSuperAdmin: false });
  await newAdmin.save();
  await logAdminTransaction(admin, 'admin_created', 'admin', newAdmin._id?.toString(), `${newAdmin.name} (${newAdmin.email}) admin account created`);

  return {
    status: 201,
    body: {
      message: 'Admin account created successfully.',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        isAdmin: true,
        isSuperAdmin: Boolean(newAdmin.isSuperAdmin),
        createdAt: newAdmin.createdAt || null
      }
    }
  };
}

async function changeOwnPassword(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const oldPassword = String(req.body?.oldPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  const confirmNewPassword = String(req.body?.confirmNewPassword || '');

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return { error: { status: 400, body: { error: 'Old password, new password, and confirmation are required.' } } };
  }

  if (newPassword !== confirmNewPassword) {
    return { error: { status: 400, body: { error: 'New passwords do not match.' } } };
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return { error: { status: 400, body: { error: passwordValidation.message } } };
  }

  let targetAdmin = null;

  if (admin?.constructor?.modelName === 'Admin') {
    targetAdmin = await Admin.findById(admin._id);
  } else if (admin?.constructor?.modelName === 'User') {
    targetAdmin = await User.findOne({ _id: admin._id, isAdmin: true });
  }

  if (!targetAdmin) {
    targetAdmin = await Admin.findById(admin._id);
  }

  if (!targetAdmin) {
    targetAdmin = await User.findOne({ _id: admin._id, isAdmin: true });
  }

  if (!targetAdmin) {
    return { error: { status: 404, body: { error: 'Admin account not found.' } } };
  }

  const isMatch = await targetAdmin.comparePassword(oldPassword);
  if (!isMatch) {
    return { error: { status: 400, body: { error: 'Old password is incorrect.' } } };
  }

  const isSamePassword = await targetAdmin.comparePassword(newPassword);
  if (isSamePassword) {
    return { error: { status: 400, body: { error: 'New password must be different from current password' } } };
  }

  targetAdmin.password = newPassword;
  await targetAdmin.save();

  await logAdminTransaction(admin, 'admin_password_changed', 'admin', targetAdmin._id?.toString(), `${targetAdmin.email} changed own password`);
  return { body: { message: 'Admin password changed successfully.' } };
}

async function listAdmins(req) {
  const { error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const admins = await Admin.find().select('-password').sort({ isSuperAdmin: -1, name: 1, email: 1 }).lean();
  return { body: admins.map(item => ({ ...item, isSuperAdmin: isSuperAdminAccount(item) })) };
}

async function deleteAdmin(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (!isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access required to delete admin accounts.' } } };
  }

  const targetAdmin = await Admin.findById(req.params.id).select('name email isSuperAdmin');
  if (!targetAdmin) return { error: { status: 404, body: { error: 'Admin account not found.' } } };
  if (String(targetAdmin._id) === String(admin._id)) return { error: { status: 400, body: { error: 'You cannot delete your own admin account.' } } };
  if (isSuperAdminAccount(targetAdmin)) return { error: { status: 403, body: { error: 'Super admin accounts cannot be deleted from this screen.' } } };

  await Admin.deleteOne({ _id: targetAdmin._id });
  await logAdminTransaction(admin, 'admin_deleted', 'admin', targetAdmin._id?.toString(), `${targetAdmin.name || 'Admin'} (${targetAdmin.email || 'no-email'}) admin account deleted`);
  return { body: { message: 'Admin account deleted successfully.' } };
}

async function listRegistrations(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const registrations = await Registration.find().sort({ updatedAt: -1, createdAt: -1 }).populate('userId', 'name email age status');
  return { body: registrations };
}

async function listTransactions(req) {
  const { error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(200).lean();
  const registrationIds = [];
  const scheduleIds = [];
  const userIds = [];

  transactions.forEach(transaction => {
    const action = String(transaction?.action || '').toLowerCase();
    const entityId = String(transaction?.entityId || '').trim();
    if (!entityId) return;

    if (action.startsWith('registration_')) {
      registrationIds.push(entityId);
    } else if (action.startsWith('pickup_confirmation_')) {
      scheduleIds.push(entityId);
    } else if (String(transaction?.entityType || '').toLowerCase() === 'user') {
      userIds.push(entityId);
    }
  });

  const [registrations, schedules, users] = await Promise.all([
    registrationIds.length
      ? Registration.find({ _id: { $in: registrationIds } })
        .populate('userId', 'name email')
        .select('userId fullname')
        .lean()
      : [],
    scheduleIds.length
      ? Schedule.find({ _id: { $in: scheduleIds } })
        .populate('userId', 'name email')
        .select('userId module')
        .lean()
      : [],
    userIds.length
      ? User.find({ _id: { $in: userIds }, isAdmin: { $ne: true } })
        .select('name email')
        .lean()
      : []
  ]);

  const registrationMap = new Map(registrations.map(item => [String(item?._id), item]));
  const scheduleMap = new Map(schedules.map(item => [String(item?._id), item]));
  const userMap = new Map(users.map(item => [String(item?._id), item]));

  return {
    body: transactions.map(transaction => {
      const action = String(transaction?.action || '').toLowerCase();
      const entityId = String(transaction?.entityId || '').trim();
      let targetUserName = '';
      let targetUserEmail = '';

      if (entityId && action.startsWith('registration_')) {
        const registration = registrationMap.get(entityId);
        const user = registration?.userId;
        targetUserName = String(user?.name || registration?.fullname || '').trim();
        targetUserEmail = String(user?.email || '').trim();
      } else if (entityId && action.startsWith('pickup_confirmation_')) {
        const schedule = scheduleMap.get(entityId);
        const user = schedule?.userId;
        targetUserName = String(user?.name || '').trim();
        targetUserEmail = String(user?.email || '').trim();
      } else if (entityId && String(transaction?.entityType || '').toLowerCase() === 'user') {
        const user = userMap.get(entityId);
        targetUserName = String(user?.name || '').trim();
        targetUserEmail = String(user?.email || '').trim();
      }

      return {
        ...transaction,
        targetUserName,
        targetUserEmail
      };
    })
  };
}

async function listPickupNotifications(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const events = await Schedule.find({ isAutoGenerated: true, source: 'approval_auto_plan', status: 'No Show' })
    .populate('userId', 'name email')
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(300)
    .lean();

  return {
    body: events.map(item => ({
      id: item?._id,
      type: 'No Show',
      studentName: item?.userId?.name || 'Student',
      studentEmail: item?.userId?.email || 'N/A',
      module: item?.module || 'N/A',
      date: item?.startTime || null,
      status: item?.status || 'Planned',
      source: item?.source || ''
    }))
  };
}

async function listPickupConfirmations(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const now = new Date();
  await Schedule.updateMany(
    {
      isAutoGenerated: true,
      source: 'approval_auto_plan',
      status: 'Planned',
      rescheduleConfirmationStatus: { $nin: ['Completed', 'Rejected'] },
      endTime: { $lt: now }
    },
    {
      $set: {
        status: 'No Show',
        rescheduleConfirmationStatus: 'Rejected',
        rescheduleCompletedAt: now
      }
    }
  );

  const events = await Schedule.find({
    isAutoGenerated: true,
    source: 'approval_auto_plan',
    status: { $in: ['Planned', 'Completed', 'No Show'] }
  })
    .populate('userId', 'name email')
    .sort({ startTime: -1 })
    .limit(300)
    .lean();

  return {
    body: events.map(item => ({
      id: item?._id,
      studentName: item?.userId?.name || 'Student',
      studentEmail: item?.userId?.email || 'N/A',
      module: item?.module || 'N/A',
      pickupDate: item?.startTime || null,
      status: item?.status || 'Planned',
      confirmationStatus: item?.rescheduleConfirmationStatus || 'Pending',
      source: item?.source || ''
    }))
  };
}

async function applyPickupConfirmation(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const action = String(req.body?.action || '').toLowerCase();
  if (!['approve', 'reject'].includes(action)) {
    return { error: { status: 400, body: { error: 'Invalid action' } } };
  }

  const schedule = await Schedule.findOne({
    _id: req.params.id,
    isAutoGenerated: true,
    source: 'approval_auto_plan',
    rescheduleConfirmationStatus: { $in: ['Pending', null] }
  });
  if (!schedule) return { error: { status: 404, body: { error: 'Pickup confirmation item not found' } } };
  const targetUser = await User.findById(schedule.userId).select('name email');

  let detail = '';
  if (action === 'approve') {
    schedule.status = 'Completed';
    schedule.rescheduleConfirmationStatus = 'Completed';
    schedule.rescheduleCompletedAt = new Date();
    await User.updateOne({ _id: schedule.userId }, { $set: { status: '' } });
    detail = 'completed the pickup request';
  } else {
    schedule.status = 'No Show';
    schedule.rescheduleConfirmationStatus = 'Rejected';
    schedule.rescheduleCompletedAt = new Date();
    detail = 'did not complete the pickup request';
  }

  await schedule.save();
  await logAdminTransaction(
    admin,
    `pickup_confirmation_${action}`,
    'schedule',
    schedule._id?.toString(),
    `${targetUser?.name || 'User'} (${targetUser?.email || 'no-email'}) ${detail}${schedule.module ? ` for ${schedule.module}` : ''}`
  );
  return { body: { message: `Pickup ${action}d successfully`, schedule } };
}

async function updateRegistrationStatus(req) {
  const nextStatus = String(req.body?.status || '').toLowerCase();
  if (!['approved', 'rejected', 'pending'].includes(nextStatus)) {
    return { error: { status: 400, body: { error: 'Invalid status' } } };
  }

  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const registration = await Registration.findById(req.params.id);
  if (!registration) return { error: { status: 404, body: { error: 'Registration not found' } } };
  if (!registration.userId) return { error: { status: 400, body: { error: 'Registration has no user' } } };

  const user = await User.findById(registration.userId);
  if (!user) return { error: { status: 404, body: { error: 'User not found' } } };

  const currentStatus = String(user.status || '').toLowerCase();

  // Use state machine to validate the transition
  const transitionResult = await registrationMachine.transition(
    registration,
    nextStatus,
    {
      adminId: admin._id,
      rejectionReason: req.body?.rejectionReason || registration.rejectionReason
    }
  );

  if (!transitionResult.success) {
    return { error: { status: 400, body: { error: transitionResult.error } } };
  }

  const previousStatus = currentStatus;
  const existingAllocations = Array.isArray(registration.inventoryAllocations) ? registration.inventoryAllocations : [];
  let newAllocations = [];
  let requestedItems = [];
  let autoScheduleCount = 0;
  let generatedSchedulePreview = null;
  let scheduleDecisionSource = null;
  let scheduleDecisionReason = '';

  try {
    if (previousStatus === 'approved' && nextStatus !== 'approved' && existingAllocations.length > 0) {
      await restoreInventoryAllocations(existingAllocations);
      registration.inventoryAllocations = [];
    }

    if (nextStatus === 'approved') {
      // Release whatever this registration still holds before allocating again,
      // whatever the user's status says. Pickup approval clears user.status, so
      // keying this on previousStatus let a second approval deduct the same
      // items from inventory twice.
      if (existingAllocations.length > 0) {
        await restoreInventoryAllocations(existingAllocations);
      }

      const allocationResult = await allocateInventoryForRegistration(registration);
      if (allocationResult.error) {
        return allocationResult;
      }
      newAllocations = allocationResult.allocations;
      requestedItems = allocationResult.requestedItems;

      await Schedule.deleteMany({ userId: user._id, isAutoGenerated: true, source: 'approval_auto_plan' });

      const existingSchedules = await Schedule.find({ userId: user._id }).select('startTime endTime').lean();
      const capacityCursorStart = new Date();
      capacityCursorStart.setHours(0, 0, 0, 0);
      const allAutoPlans = await Schedule.find({
        isAutoGenerated: true,
        source: 'approval_auto_plan',
        startTime: { $gte: capacityCursorStart }
      }).select('startTime').lean();

      const dailyLoadMap = countDailyLoadsFromSchedules(allAutoPlans);

      const {
        events: generatedPlan,
        engine: scheduleEngine,
        model: scheduleModel,
        decisionSource,
        decisionReason,
        generatedSchedule
      } = await buildAutoScheduleForApprovedRegistration({
        userId: user._id,
        moduleName: registration.module || user.module || '',
        userName: user.name || 'Student',
        pickupDate: registration.pickupDate,
        existingSchedules,
        dailyLoadMap,
        maxPickupsPerDay: 100
      });

      if (generatedPlan.length > 0) {
        await Schedule.insertMany(generatedPlan);
        autoScheduleCount = generatedPlan.length;
        user._scheduleEngine = scheduleEngine;
        user._scheduleModel = scheduleModel;
        generatedSchedulePreview = generatedSchedule;
        scheduleDecisionSource = decisionSource || scheduleEngine || null;
        scheduleDecisionReason = String(decisionReason || generatedSchedule?.description || '').trim();

        const selectedPickupDate = generatedPlan[0]?.startTime ? new Date(generatedPlan[0].startTime) : null;
        if (selectedPickupDate && !Number.isNaN(selectedPickupDate.getTime())) {
          registration.pickupDate = selectedPickupDate;
        }
      }

      registration.inventoryAllocations = newAllocations;
    }

    user.status = nextStatus;
    await user.save();
    registration.updatedAt = new Date();
    await registration.save();

    // Invalidate dashboard cache since registration statuses changed
    cache.delByPrefix(CACHE_KEYS.ANALYTICS_PREFIX);
    cache.delByPrefix(CACHE_KEYS.DASHBOARD_PREFIX);
  } catch {
    if (newAllocations.length > 0) {
      await restoreInventoryAllocations(newAllocations);
    }
    return { error: { status: 500, body: { error: 'Failed to update registration status' } } };
  }

  const scheduleEngine = user._scheduleEngine || 'none';
  const scheduleModel = user._scheduleModel ? ` model=${user._scheduleModel}` : '';
  const detailSuffix = autoScheduleCount > 0 ? ` with auto schedule (${autoScheduleCount} events, engine=${scheduleEngine}${scheduleModel})` : '';
  const inventorySuffix = nextStatus === 'approved' && newAllocations.length > 0
    ? ` inventory allocated (${requestedItems.join(', ')})`
    : (previousStatus === 'approved' && nextStatus !== 'approved' && existingAllocations.length > 0 ? ' inventory restored' : '');

  await logAdminTransaction(admin, `registration_${nextStatus}`, 'registration', registration._id?.toString(), `${user.name || 'User'} (${user.email || 'no-email'}) marked as ${nextStatus}${detailSuffix}${inventorySuffix}`);

  // Fire-and-forget email notifications for registration lifecycle events
  if (nextStatus === 'approved') {
    sendRegistrationApproved({
      email: user.email,
      name: user.name || 'Student',
      studentNumber: user.studentNumber || 'N/A',
      pickupDate: registration.pickupDate || user.pickupDate || null
    }).catch(err => logger.error('Failed to send approval email', { error: err.message }));
  } else if (nextStatus === 'rejected') {
    sendRegistrationRejected({
      email: user.email,
      name: user.name || 'Student',
      studentNumber: user.studentNumber || 'N/A',
      reason: registration.rejectionReason || req.body?.rejectionReason || ''
    }).catch(err => logger.error('Failed to send rejection email', { error: err.message }));
  }

  return {
    body: {
      message: autoScheduleCount > 0
        ? `Registration ${nextStatus}. Auto schedule generated (${autoScheduleCount} events).${newAllocations.length > 0 ? ' Inventory deducted based on requested supplies.' : ''}`
        : `Registration ${nextStatus}${newAllocations.length > 0 ? '. Inventory deducted based on requested supplies.' : ''}`,
      status: user.status,
      autoScheduleCount,
      scheduleEngine: user._scheduleEngine || (autoScheduleCount > 0 ? 'local' : 'none'),
      scheduleModel: user._scheduleModel || null,
      inventoryAllocations: registration.inventoryAllocations || [],
      generatedSchedule: generatedSchedulePreview,
      scheduleDecisionSource,
      scheduleDecisionReason
    }
  };
}

async function archiveRegistration(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const registration = await Registration.findById(req.params.id);
  if (!registration) return { error: { status: 404, body: { error: 'Registration not found' } } };

  registration.isArchived = true;
  registration.archivedAt = new Date();
  await registration.save();

  cache.delByPrefix(CACHE_KEYS.ANALYTICS_PREFIX);
  cache.delByPrefix(CACHE_KEYS.DASHBOARD_PREFIX);

  const registrantName = `${registration.firstName || ''} ${registration.lastName || ''}`.trim() || registration.fullname || 'Student';
  await logAdminTransaction(
    admin,
    'registration_archived',
    'registration',
    registration._id?.toString(),
    `${registrantName} (${registration.module || registration.moduleCode || 'no-module'}) archived`
  );

  return { body: { message: 'Registration archived successfully' } };
}

async function getUserDetails(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const user = await User.findOne({ _id: req.params.id, isAdmin: { $ne: true }, isDeleted: { $ne: true } }).select('-password');
  if (!user) return { error: { status: 404, body: { error: 'User not found' } } };

  const registration = await Registration.findOne({ userId: req.params.id });
  return { body: { user: user.toObject(), registration: registration ? registration.toObject() : null } };
}

async function deleteUser(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };
  if (isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access is limited to monitoring and admin account management.' } } };
  }

  const targetUser = await User.findOne({ _id: req.params.id, isAdmin: { $ne: true }, isDeleted: { $ne: true } }).select('name email');
  if (!targetUser) return { error: { status: 404, body: { error: 'User not found' } } };

  // Soft delete: mark as deleted instead of removing from database
  targetUser.isDeleted = true;
  targetUser.deletedAt = new Date();
  targetUser.deletedBy = admin._id;
  targetUser.deletionReason = String(req.body?.deletionReason || 'User account removed by admin').trim();
  await targetUser.save();

  // Also soft-delete related registration
  await Registration.updateOne(
    { userId: req.params.id },
    { $set: { status: 'rejected', returnStatus: 'cancelled' } }
  );

  await logAdminTransaction(
    admin, 
    'user_deleted', 
    'user', 
    req.params.id, 
    `${targetUser.name || 'User'} (${targetUser.email || 'no-email'}) soft-deleted${targetUser.deletionReason ? `: ${targetUser.deletionReason}` : ''}`
  );
  return { body: { message: 'User deleted successfully' } };
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







