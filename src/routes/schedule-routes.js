const router = require('express').Router();

const { protect } = require('../middlewares/auth');
const {
  checkSchedulePermissions,
  checkVisitsPermissions,
} = require('../middlewares/schedule');
const {
  getSchedule,
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
const visitRouter = require('./visit-routes');

// for nested routes
router.use('/:scheduleId/visits', visitRouter);

// Protect all routes after this middleware
router.use(protect);

// ROUTES LIST
router.post('/', createScheduleValidator, createSchedule);

router.get('/my', getSchedulesValidator, getMySchedules);

router.get('/shared', getSchedulesValidator, getSharedSchedules);

router
  .route('/:id')
  .get(checkVisitsPermissions, getSchedule)
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
