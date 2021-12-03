const router = require('express').Router();

const {
  login,
  logout,
  getMe,
  updateMe,
  updateMyEmail,
  resetPassword,
  forgotPassword,
  updateMyPassword,
  getInvitationData,
  signUpByInvitation,
} = require('../controllers/auth-controller');
const {
  loginValidator,
  updateMeValidator,
  passwordsValidator,
  updateMyEmailValidator,
  forgotPasswordValidator,
  updateMyPasswordValidator,
} = require('./validators/auth-validators');
const { protect } = require('../middlewares/auth');
const { uploadSingleImage } = require('../middlewares/upload');
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

module.exports = router;
