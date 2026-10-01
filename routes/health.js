const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Registration = require('../models/Registration');
const Schedule = require('../models/Schedule');
const Feedback = require('../models/Feedback');
const ReturnRequest = require('../models/ReturnRequest');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbStateMap[dbState] || 'unknown',
    uptime: process.uptime()
  });
});

/**
 * GET /api/health/data-integrity
 * Data integrity check - detects orphaned records and inconsistencies
 */
router.get('/data-integrity', async (req, res) => {
  const issues = [];

  try {
    // 1. Check for orphaned Registrations (no corresponding User)
    const orphanedRegistrations = await Registration.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: { user: { $size: 0 } } },
      { $count: 'count' }
    ]);

    if (orphanedRegistrations[0]?.count > 0) {
      issues.push({
        type: 'orphaned_records',
        collection: 'registrations',
        count: orphanedRegistrations[0].count,
        description: 'Registrations with no corresponding User document',
        severity: 'high'
      });
    }

    // 2. Check for orphaned Schedules (no corresponding User)
    const orphanedSchedules = await Schedule.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: { user: { $size: 0 } } },
      { $count: 'count' }
    ]);

    if (orphanedSchedules[0]?.count > 0) {
      issues.push({
        type: 'orphaned_records',
        collection: 'schedules',
        count: orphanedSchedules[0].count,
        description: 'Schedules with no corresponding User document',
        severity: 'high'
      });
    }

    // 3. Check for orphaned Feedbacks (no corresponding User)
    const orphanedFeedbacks = await Feedback.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: { user: { $size: 0 } } },
      { $count: 'count' }
    ]);

    if (orphanedFeedbacks[0]?.count > 0) {
      issues.push({
        type: 'orphaned_records',
        collection: 'feedbacks',
        count: orphanedFeedbacks[0].count,
        description: 'Feedbacks with no corresponding User document',
        severity: 'medium'
      });
    }

    // 4. Check for orphaned ReturnRequests (no corresponding User)
    const orphanedReturns = await ReturnRequest.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: { user: { $size: 0 } } },
      { $count: 'count' }
    ]);

    if (orphanedReturns[0]?.count > 0) {
      issues.push({
        type: 'orphaned_records',
        collection: 'returnrequests',
        count: orphanedReturns[0].count,
        description: 'Return requests with no corresponding User document',
        severity: 'high'
      });
    }

    // 5. Check for ReturnRequests referencing deleted Registrations
    const orphanedReturnRegistrations = await ReturnRequest.aggregate([
      {
        $lookup: {
          from: 'registrations',
          localField: 'registrationId',
          foreignField: '_id',
          as: 'registration'
        }
      },
      { $match: { registration: { $size: 0 } } },
      { $count: 'count' }
    ]);

    if (orphanedReturnRegistrations[0]?.count > 0) {
      issues.push({
        type: 'orphaned_records',
        collection: 'returnrequests',
        count: orphanedReturnRegistrations[0].count,
        description: 'Return requests with no corresponding Registration document',
        severity: 'medium'
      });
    }

    // 6. Check for duplicate emails (data inconsistency)
    const duplicateEmails = await User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'count' }
    ]);

    if (duplicateEmails[0]?.count > 0) {
      issues.push({
        type: 'data_inconsistency',
        collection: 'users',
        count: duplicateEmails[0].count,
        description: 'Duplicate email addresses found among active users',
        severity: 'critical'
      });
    }

    // 7. Check for Inventory items with negative quantity
    const negativeInventory = await Inventory.countDocuments({ quantity: { $lt: 0 } });
    if (negativeInventory > 0) {
      issues.push({
        type: 'data_inconsistency',
        collection: 'inventory',
        count: negativeInventory,
        description: 'Inventory items with negative quantity',
        severity: 'high'
      });
    }

    // 8. Check for low stock items (below reorder level)
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    // 9. Check for Schedules with endTime before startTime
    const invalidSchedules = await Schedule.countDocuments({
      $expr: { $gte: ['$startTime', '$endTime'] }
    });

    if (invalidSchedules > 0) {
      issues.push({
        type: 'data_inconsistency',
        collection: 'schedules',
        count: invalidSchedules,
        description: 'Schedules with end time before or equal to start time',
        severity: 'high'
      });
    }

    // 10. Count soft-deleted users
    const softDeletedUsers = await User.countDocuments({ isDeleted: true });

    res.json({
      status: issues.length > 0 ? 'issues_found' : 'healthy',
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
        highIssues: issues.filter(i => i.severity === 'high').length,
        mediumIssues: issues.filter(i => i.severity === 'medium').length,
        softDeletedUsers,
        lowStockItems
      },
      issues
    });

    if (issues.length > 0) {
      logger.warn('Data integrity issues detected', { 
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length 
      });
    }
  } catch (error) {
    logger.error('Data integrity check failed', { error: error.message });
    res.status(500).json({
      status: 'error',
      error: 'Data integrity check failed',
      details: error.message
    });
  }
});

module.exports = router;

