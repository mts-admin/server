const router = require('express').Router();

const { protect } = require('../middlewares/auth');
const { checkSchedulePermissions } = require('../middlewares/schedule');
const {
  leaveSchedule,
  createSchedule,
  getMySchedules,
  updateSchedule,
  deleteSchedule,
  getSharedSchedules,
  addParticipant,
  updateParticipant,
  removeParticipant,
} = require('../controllers/schedules-controller');

// Protect all routes after this middleware
router.use(protect);

router.post('/', createSchedule);

router.get('/my', getMySchedules);

router.get('/shared', getSharedSchedules);

router
  .route('/:id')
  .patch(checkSchedulePermissions, updateSchedule)
  .delete(checkSchedulePermissions, deleteSchedule);

router
  .route('/:id/participants')
  .post(checkSchedulePermissions, addParticipant)
  .patch(checkSchedulePermissions, updateParticipant)
  .delete(checkSchedulePermissions, removeParticipant);

router.patch('/:id/leave', leaveSchedule);

module.exports = router;
