/**
 * Feedback SLA (Service Level Agreement) Monitor Service
 * Tracks time-to-respond for feedback and auto-escalates urgent/unresolved feedback.
 */
const Feedback = require('../models/Feedback');
const logger = require('../utils/logger');

const ESCALATION_THRESHOLDS = {
  urgent: 24 * 60 * 60 * 1000, // 24 hours
  high: 48 * 60 * 60 * 1000,   // 48 hours
  medium: 72 * 60 * 60 * 1000, // 72 hours
  low: 120 * 60 * 60 * 1000    // 5 days
};

const ESCALATION_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Calculate the response time for a feedback item (time from creation to first admin response)
 * @param {object} feedback - Feedback document
 * @returns {number|null} Response time in milliseconds, or null if no response yet
 */
function calculateResponseTime(feedback) {
  if (!feedback.createdAt) return null;
  if (!feedback.adminResponses || feedback.adminResponses.length === 0) return null;

  const createdAt = new Date(feedback.createdAt).getTime();
  const firstResponseAt = new Date(feedback.adminResponses[0].createdAt).getTime();

  if (Number.isNaN(createdAt) || Number.isNaN(firstResponseAt)) return null;
  return firstResponseAt - createdAt;
}

/**
 * Check if a feedback item has breached its SLA threshold
 * @param {object} feedback - Feedback document
 * @returns {object|null} SLA breach info or null if no breach
 */
function checkSlaBreach(feedback) {
  if (!feedback.createdAt) return null;
  if (feedback.status === 'resolved' || feedback.status === 'closed') return null;

  const createdAt = new Date(feedback.createdAt).getTime();
  if (Number.isNaN(createdAt)) return null;

  const priority = String(feedback.priority || 'medium').toLowerCase();
  const threshold = ESCALATION_THRESHOLDS[priority] || ESCALATION_THRESHOLDS.medium;
  const elapsed = Date.now() - createdAt;

  if (elapsed <= threshold) return null;

  return {
    feedbackId: feedback._id,
    priority,
    elapsed: Math.round(elapsed / (60 * 60 * 1000) * 10) / 10 + ' hours',
    threshold: Math.round(threshold / (60 * 60 * 1000) * 10) / 10 + ' hours',
    overdueBy: Math.round((elapsed - threshold) / (60 * 60 * 1000) * 10) / 10 + ' hours'
  };
}

/**
 * Run SLA audit: scan all unresolved feedback and identify SLA breaches
 * @returns {Promise<object>} Audit results
 */
async function runSlaAudit() {
  const results = {
    scanned: 0,
    breaches: [],
    escalated: 0,
    errors: []
  };

  try {
    const unresolvedFeedbacks = await Feedback.find({
      status: { $in: ['pending', 'reviewed'] }
    }).lean();

    results.scanned = unresolvedFeedbacks.length;

    for (const feedback of unresolvedFeedbacks) {
      try {
        const breach = checkSlaBreach(feedback);
        if (breach) {
          results.breaches.push(breach);

          // Auto-escalate urgent priority feedback that has breached SLA
          if (feedback.priority === 'urgent' && feedback.status === 'pending') {
            // Flag as escalated by adding an admin response note
            await Feedback.updateOne(
              { _id: feedback._id },
              {
                $push: {
                  adminResponses: {
                    adminId: null,
                    adminName: 'SLA Monitor',
                    content: `[AUTO-ESCALATED] This ${feedback.priority} priority feedback has exceeded the ${ESCALATION_THRESHOLDS.urgent / (60 * 60 * 1000)}h response SLA. Requires immediate attention.`,
                    createdAt: new Date()
                  }
                }
              }
            );
            results.escalated++;
            logger.warn('Feedback auto-escalated due to SLA breach', {
              feedbackId: String(feedback._id),
              priority: feedback.priority,
              elapsed: breach.elapsed
            });
          }
        }
      } catch (itemError) {
        results.errors.push({
          feedbackId: String(feedback._id),
          error: itemError.message
        });
      }
    }
  } catch (error) {
    logger.error('SLA audit failed', { error: error.message });
    results.errors.push({ error: error.message });
  }

  if (results.breaches.length > 0) {
    logger.info('SLA audit completed', {
      scanned: results.scanned,
      breaches: results.breaches.length,
      escalated: results.escalated
    });
  }

  return results;
}

/**
 * Get SLA dashboard metrics
 * @returns {Promise<object>} SLA metrics
 */
async function getSlaMetrics() {
  try {
    const now = new Date();

    const feedbacks = await Feedback.find({
      status: { $in: ['pending', 'reviewed'] }
    }).select('createdAt priority status').lean();

    const metrics = {
      totalOpen: feedbacks.length,
      byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
      slaBreaches: 0,
      averageResponseTime: null,
      responseTimes: []
    };

    let totalResponseTimeMs = 0;
    let responseTimeCount = 0;

    for (const feedback of feedbacks) {
      const priority = String(feedback.priority || 'medium').toLowerCase();
      metrics.byPriority[priority] = (metrics.byPriority[priority] || 0) + 1;

      const breach = checkSlaBreach(feedback);
      if (breach) metrics.slaBreaches++;

      // Calculate response time for feedbacks with admin responses
      const fullFeedback = await Feedback.findById(feedback._id)
        .select('adminResponses createdAt')
        .lean();
      const responseTime = calculateResponseTime(fullFeedback);
      if (responseTime !== null) {
        totalResponseTimeMs += responseTime;
        responseTimeCount++;
        metrics.responseTimes.push(responseTime);
      }
    }

    if (responseTimeCount > 0) {
      metrics.averageResponseTime = Math.round(totalResponseTimeMs / responseTimeCount);
    }

    // Clean up responseTimes array (keep summary, drop raw data for response size)
    if (metrics.responseTimes.length > 0) {
      metrics.responseTimes.sort((a, b) => a - b);
      metrics.responseTimeSummary = {
        min: metrics.responseTimes[0],
        max: metrics.responseTimes[metrics.responseTimes.length - 1],
        median: metrics.responseTimes[Math.floor(metrics.responseTimes.length / 2)],
        average: metrics.averageResponseTime
      };
    }
    delete metrics.responseTimes;

    return metrics;
  } catch (error) {
    logger.error('Failed to get SLA metrics', { error: error.message });
    return null;
  }
}

/**
 * Initialize periodic SLA monitoring (call on server start)
 * @returns {object} Interval reference
 */
function startSlaMonitor(scheduler) {
  // Run initial audit
  runSlaAudit().catch(err => {
    logger.error('Initial SLA audit failed', { error: err.message });
  });

  // Schedule periodic audits
  const interval = setInterval(() => {
    runSlaAudit().catch(err => {
      logger.error('Periodic SLA audit failed', { error: err.message });
    });
  }, ESCALATION_CHECK_INTERVAL_MS);

  if (interval.unref) interval.unref();

  logger.info('SLA monitor started', {
    checkInterval: ESCALATION_CHECK_INTERVAL_MS / 1000 + 's',
    thresholds: Object.entries(ESCALATION_THRESHOLDS).map(
      ([p, t]) => `${p}: ${t / (60 * 60 * 1000)}h`
    ).join(', ')
  });

  return interval;
}

module.exports = {
  runSlaAudit,
  getSlaMetrics,
  startSlaMonitor,
  calculateResponseTime,
  checkSlaBreach,
  ESCALATION_THRESHOLDS
};

