const router = require('express').Router();

const {
  login,
  logout,
  inviteUser,
  resetPassword,
  forgotPassword,
  updatePassword,
  cancelInvitation,
  getInvitationData,
  signUpByInvitation,
} = require('../controllers/auth-controller');
const {
  loginValidator,
  passwordsValidator,
  inviteUserValidator,
  forgotPasswordValidator,
  updateMyPasswordValidator,
} = require('./validators/auth-validators');
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLE } = require('../constants/users');

router.post('/login', loginValidator, login);
router.get('/logout', logout);
router
  .route('/signup-by-invitation/:token')
  .get(getInvitationData)
  .post(passwordsValidator, signUpByInvitation);

router.post('/forgotPassword', forgotPasswordValidator, forgotPassword);
router.patch('/resetPassword/:token', passwordsValidator, resetPassword);

// Protect all routes after this middleware
router.use(protect);

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

router.patch('/updateMyPassword', updateMyPasswordValidator, updatePassword);

module.exports = router;
