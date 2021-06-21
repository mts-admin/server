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
const {
  createScheduleValidator,
  getSchedulesValidator,
  updateScheduleValidator,
  addParticipantValidator,
  updateParticipantValidator,
  deleteParticipantValidator,
} = require('./validators/schedule-validators');

// Protect all routes after this middleware
router.use(protect);

router.post('/', createScheduleValidator, createSchedule);

router.get('/my', getSchedulesValidator, getMySchedules);

router.get('/shared', getSchedulesValidator, getSharedSchedules);

router
  .route('/:id')
  .patch(updateScheduleValidator, checkSchedulePermissions, updateSchedule)
  .delete(checkSchedulePermissions, deleteSchedule);

router
  .route('/:id/participants')
  .post(addParticipantValidator, checkSchedulePermissions, addParticipant)
  .patch(
    updateParticipantValidator,
    checkSchedulePermissions,
    updateParticipant
  )
  .delete(
    deleteParticipantValidator,
    checkSchedulePermissions,
    removeParticipant
  );

router.patch('/:id/leave', leaveSchedule);

module.exports = router;
