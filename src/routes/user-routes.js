const router = require('express').Router();

const { protect, restrictTo } = require('../middlewares/auth');
const {
  getMe,
  updateMe,
  updateMyEmail,
  updateMyPassword,
  getUser,
  updateUser,
  getUsersList,
} = require('../controllers/user-controller');
const {
  getUsersListValidator,
  updateUserValidator,
  updateMeValidator,
  updateMyEmailValidator,
  updateMyPasswordValidator,
} = require('./validators/user-validator');
const { USER_ROLE } = require('../constants/users');

router.use(protect);

router.route('/me').get(getMe).patch(updateMeValidator, updateMe);

router.patch('/me/email', updateMyEmailValidator, updateMyEmail);

router.patch('/me/password', updateMyPasswordValidator, updateMyPassword);

router.get(
  '/',
  getUsersListValidator,
  restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
  getUsersList
);

router
  .route('/:id')
  .get(restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER), getUser)
  .patch(updateUserValidator, restrictTo(USER_ROLE.OWNER), updateUser);

module.exports = router;
