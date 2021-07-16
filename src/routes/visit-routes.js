// for nested routes (schedules)
const router = require('express').Router({ mergeParams: true });

const { protect } = require('../middlewares/auth');
const { checkVisitsPermissions } = require('../middlewares/schedule');
const {
  getVisit,
  updateVisit,
  deleteVisit,
  getScheduleVisits,
  createOneOffVisit,
  createRecurringVisits,
  updateVisitsGroup,
  deleteVisitsGroup,
} = require('../controllers/visits-controller');
const {
  updateVisitValidator,
  getScheduleVisitsValidator,
  createOneOffVisitValidator,
  createRecurringVisitsValidator,
} = require('./validators/visit-validator');

// Protect all routes after this middleware
router.use(protect);
router.use(checkVisitsPermissions);

// '/' route is the same as '/schedules/:scheduleId/visits'
router.get('/', getScheduleVisitsValidator, getScheduleVisits);

router.post('/one-off', createOneOffVisitValidator, createOneOffVisit);

router.post(
  '/recurring',
  createRecurringVisitsValidator,
  createRecurringVisits
);

router
  .route('/:visitId')
  .get(getVisit)
  .patch(updateVisitValidator, updateVisit)
  .delete(deleteVisit);

router
  .route('/group/:groupId')
  .patch(updateVisitValidator, updateVisitsGroup)
  .delete(deleteVisitsGroup);

module.exports = router;
