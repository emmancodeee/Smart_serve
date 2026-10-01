const scheduleService = require('../services/scheduleService');

async function listSchedules(req, res) {
  try {
    await scheduleService.processNoShowReschedulesForUser(req.user);
    await scheduleService.ensurePickupScheduleForApprovedUser(req.user);

    const schedules = await scheduleService.getSchedulesForUser(req.user._id);
    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getScheduleSummary(req, res) {
  try {
    const summary = await scheduleService.getScheduleSummaryForUser(req.user._id);
    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function checkConflicts(req, res) {
  try {
    const result = await scheduleService.checkConflictsForUser(req.user._id, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createSchedule(req, res) {
  try {
    const result = await scheduleService.createScheduleForUser(req.user._id, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    return res.status(result.status || 200).json(result.body);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateSchedule(req, res) {
  try {
    const result = await scheduleService.updateScheduleForUser(req.user._id, req.params.id, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    return res.json(result.body);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteSchedule(req, res) {
  try {
    const result = await scheduleService.deleteScheduleForUser(req.user._id, req.params.id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    return res.json(result.body);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listSchedules,
  getScheduleSummary,
  checkConflicts,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
