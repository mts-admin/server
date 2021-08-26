const router = require('express').Router();

const { protect, restrictTo } = require('../middlewares/auth');
const {
  getUser,
  updateUser,
  getUsersList,
} = require('../controllers/user-controller');
const {
  getUsersListValidator,
  updateUserValidator,
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

module.exports = router;
