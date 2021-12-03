const router = require('express').Router();

const { protect, restrictTo } = require('../middlewares/auth');
const {
  getUser,
  updateUser,
  inviteUser,
  getUsersList,
  cancelInvitation,
} = require('../controllers/user-controller');
const {
  getUsersListValidator,
  updateUserValidator,
  inviteUserValidator,
} = require('./validators/user-validator');
const { USER_ROLE } = require('../constants/users');

router.use(protect);

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

router.post(
  '/invitation',
  inviteUserValidator,
  restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
  inviteUser
);

router.delete(
  '/invitation/:token',
  restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
  cancelInvitation
);

module.exports = router;
