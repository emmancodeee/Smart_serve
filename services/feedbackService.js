const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { sanitizeString, sanitizeEmail } = require('../utils/sanitize');
const logger = require('../utils/logger');

async function createFeedback(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const user = await User.findById(userId);
  if (!user || user.isAdmin) {
    return { error: { status: 404, body: { error: 'User not found' } } };
  }

  const category = String(req.body?.category || '').toLowerCase();
  const subject = sanitizeString(req.body?.subject || '');
  const content = sanitizeString(req.body?.content || '');
  const rating = Number(req.body?.rating) || null;
  const relatedItemId = req.body?.relatedItemId || null;
  const relatedItemType = req.body?.relatedItemType || null;
  const priority = String(req.body?.priority || 'medium').toLowerCase();

  // Validate category
  const validCategories = ['module', 'uniform', 'books', 'general', 'service'];
  if (!validCategories.includes(category)) {
    return { error: { status: 400, body: { error: 'Invalid feedback category' } } };
  }

  // Validate required fields
  if (!subject || subject.length < 3) {
    return { error: { status: 400, body: { error: 'Subject must be at least 3 characters' } } };
  }

  if (!content || content.length < 10) {
    return { error: { status: 400, body: { error: 'Content must be at least 10 characters' } } };
  }

  // Validate rating if provided
  if (rating !== null && (rating < 1 || rating > 5)) {
    return { error: { status: 400, body: { error: 'Rating must be between 1 and 5' } } };
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return { error: { status: 400, body: { error: 'Invalid priority level' } } };
  }

  // Validate related item type if provided
  if (relatedItemType) {
    const validTypes = ['registration', 'schedule', 'inventory'];
    if (!validTypes.includes(relatedItemType)) {
      return { error: { status: 400, body: { error: 'Invalid related item type' } } };
    }
  }

  const feedback = new Feedback({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    category,
    subject,
    content,
    rating,
    relatedItemId,
    relatedItemType,
    priority,
    status: 'pending'
  });

  await feedback.save();

  logger.auth('feedback_created', userId.toString(), { 
    category, 
    subject, 
    rating,
    priority 
  });

  return {
    status: 201,
    body: {
      message: 'Feedback submitted successfully',
      feedback: {
        _id: feedback._id,
        category: feedback.category,
        subject: feedback.subject,
        status: feedback.status,
        priority: feedback.priority,
        createdAt: feedback.createdAt
      }
    }
  };
}

async function getUserFeedbacks(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const feedbacks = await Feedback.find({ userId, isArchived: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean();

  return { body: feedbacks };
}

async function getFeedbackById(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const feedback = await Feedback.findById(req.params.id).lean();
  if (!feedback) {
    return { error: { status: 404, body: { error: 'Feedback not found' } } };
  }

  // Check if user owns this feedback
  if (String(feedback.userId) !== String(userId)) {
    return { error: { status: 403, body: { error: 'Access denied' } } };
  }

  return { body: feedback };
}

async function updateFeedback(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) {
    return { error: { status: 404, body: { error: 'Feedback not found' } } };
  }

  // Check if user owns this feedback
  if (String(feedback.userId) !== String(userId)) {
    return { error: { status: 403, body: { error: 'Access denied' } } };
  }

  const content = sanitizeString(req.body?.content || '');
  const rating = Number(req.body?.rating) || null;

  if (content && content.length < 10) {
    return { error: { status: 400, body: { error: 'Content must be at least 10 characters' } } };
  }

  if (rating !== null && (rating < 1 || rating > 5)) {
    return { error: { status: 400, body: { error: 'Rating must be between 1 and 5' } } };
  }

  if (content) feedback.content = content;
  if (rating !== null) feedback.rating = rating;

  await feedback.save();

  logger.auth('feedback_updated', userId.toString(), { 
    feedbackId: feedback._id.toString() 
  });

  return {
    body: {
      message: 'Feedback updated successfully',
      feedback
    }
  };
}

async function archiveFeedback(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) {
    return { error: { status: 404, body: { error: 'Feedback not found' } } };
  }

  // Check if user owns this feedback
  if (String(feedback.userId) !== String(userId)) {
    return { error: { status: 403, body: { error: 'Access denied' } } };
  }

  feedback.isArchived = true;
  feedback.archivedAt = new Date();

  await feedback.save();

  logger.auth('feedback_archived', userId.toString(), { 
    feedbackId: feedback._id.toString() 
  });

  return { body: { message: 'Feedback archived successfully' } };
}

// Admin functions
async function getAllFeedbacks(req) {
  const { status, category, priority, page = 1, limit = 20 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);
  
  const feedbacks = await Feedback.find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Feedback.countDocuments(filter);

  return {
    body: {
      feedbacks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  };
}

async function getFeedbackDetails(req) {
  const feedback = await Feedback.findById(req.params.id).lean();
  if (!feedback) {
    return { error: { status: 404, body: { error: 'Feedback not found' } } };
  }

  return { body: feedback };
}

async function addAdminResponse(req) {
  const adminId = req.admin?._id || req.auth?.admin?._id || req.auth?.decoded?.id;
  if (!adminId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) {
    return { error: { status: 404, body: { error: 'Feedback not found' } } };
  }

  const content = sanitizeString(req.body?.content || '');
  if (!content || content.length < 5) {
    return { error: { status: 400, body: { error: 'Response must be at least 5 characters' } } };
  }

  feedback.adminResponses.push({
    adminId,
    adminName: req.admin.name || 'Admin',
    content,
    createdAt: new Date()
  });

  feedback.status = 'reviewed';
  feedback.reviewedBy = adminId;
  feedback.reviewedAt = new Date();

  await feedback.save();

  logger.auth('feedback_admin_response', adminId.toString(), { 
    feedbackId: feedback._id.toString() 
  });

  return {
    body: {
      message: 'Admin response added successfully',
      feedback
    }
  };
}

async function updateFeedbackStatus(req) {
  const adminId = req.admin?._id || req.auth?.admin?._id || req.auth?.decoded?.id;
  if (!adminId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) {
    return { error: { status: 404, body: { error: 'Feedback not found' } } };
  }

  const status = String(req.body?.status || '').toLowerCase();
  const validStatuses = ['pending', 'reviewed', 'resolved', 'closed'];
  
  if (!validStatuses.includes(status)) {
    return { error: { status: 400, body: { error: 'Invalid status' } } };
  }

  const resolutionNotes = sanitizeString(req.body?.resolutionNotes || '');

  feedback.status = status;
  feedback.reviewedBy = adminId;
  feedback.reviewedAt = new Date();
  
  if (resolutionNotes) {
    feedback.resolutionNotes = resolutionNotes;
  }

  await feedback.save();

  logger.auth('feedback_status_updated', adminId.toString(), { 
    feedbackId: feedback._id.toString(),
    status 
  });

  return {
    body: {
      message: 'Feedback status updated successfully',
      feedback
    }
  };
}

async function updateFeedbackPriority(req) {
  const adminId = req.admin?._id || req.auth?.admin?._id || req.auth?.decoded?.id;
  if (!adminId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) {
    return { error: { status: 404, body: { error: 'Feedback not found' } } };
  }

  const priority = String(req.body?.priority || 'medium').toLowerCase();
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  
  if (!validPriorities.includes(priority)) {
    return { error: { status: 400, body: { error: 'Invalid priority' } } };
  }

  feedback.priority = priority;
  await feedback.save();

  logger.auth('feedback_priority_updated', adminId.toString(), { 
    feedbackId: feedback._id.toString(),
    priority 
  });

  return {
    body: {
      message: 'Feedback priority updated successfully',
      feedback
    }
  };
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