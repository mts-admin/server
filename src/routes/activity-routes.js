const router = require('express').Router();

const {
  getMyActivities,
  getUserActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activity-controller');
const {
  getActivitiesValidator,
  createActivityValidator,
  updateActivityValidator,
  changeActivityStatusValidator,
} = require('./validators/activity-validator');
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLE } = require('../constants/users');

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(getActivitiesValidator, getMyActivities)
  .post(
    createActivityValidator,
    restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
    createActivity
  );

router
  .route('/:id')
  .get(getActivity)
  .patch(
    updateActivityValidator,
    restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
    updateActivity
  )
  .delete(restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER), deleteActivity);

router.patch('/:id/status', changeActivityStatusValidator, updateActivity);

router.get(
  '/user/:userId',
  getActivitiesValidator,
  restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
  getUserActivities
);

module.exports = router;
