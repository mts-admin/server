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
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLE } = require('../constants/users');

router.post('/login', login);
router.get('/logout', logout);
router
  .route('/signup-by-invitation/:token')
  .get(getInvitationData)
  .post(signUpByInvitation);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.post(
  '/invitation',
  restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
  inviteUser
);

router.delete(
  '/invitation/:token',
  restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER),
  cancelInvitation
);

router.patch('/updateMyPassword', updatePassword);

module.exports = router;
