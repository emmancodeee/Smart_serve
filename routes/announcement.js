const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const { authenticateScheduleUser } = require('../middlewares/authenticateScheduleUser');

const router = express.Router();

router.use(authenticateScheduleUser);

router.get('/', scheduleController.listSchedules);
router.get('/analytics/summary', scheduleController.getScheduleSummary);
router.post('/check-conflicts', scheduleController.checkConflicts);
router.post('/add', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
