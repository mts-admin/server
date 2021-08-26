const router = require('express').Router();

const {
  login,
  logout,
  getMe,
  updateMe,
  inviteUser,
  updateMyEmail,
  resetPassword,
  forgotPassword,
  updateMyPassword,
  cancelInvitation,
  getInvitationData,
  signUpByInvitation,
} = require('../controllers/auth-controller');
const {
  loginValidator,
  updateMeValidator,
  passwordsValidator,
  inviteUserValidator,
  updateMyEmailValidator,
  forgotPasswordValidator,
  updateMyPasswordValidator,
} = require('./validators/auth-validators');
const { protect, restrictTo } = require('../middlewares/auth');
const { uploadSingleImage } = require('../middlewares/upload');
const { USER_ROLE } = require('../constants/users');
const { IMAGE_FIELD_NAME } = require('../constants/image-types');

router.post('/login', loginValidator, login);
router.get('/logout', logout);
router
  .route('/signup-by-invitation/:token')
  .get(getInvitationData)
  .post(passwordsValidator, signUpByInvitation);

router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.patch('/reset-password/:token', passwordsValidator, resetPassword);

// Protect all routes after this middleware
router.use(protect);

router
  .route('/me')
  .get(getMe)
  .patch(
    uploadSingleImage(IMAGE_FIELD_NAME.AVATAR),
    updateMeValidator,
    updateMe
  );

router.patch('/me/email', updateMyEmailValidator, updateMyEmail);

router.patch('/me/password', updateMyPasswordValidator, updateMyPassword);

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
