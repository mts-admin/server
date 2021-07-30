const createError = require('http-errors');

const User = require('../models/user');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { createSendToken } = require('../utils/auth');
const Email = require('../utils/email');
const {
  hashString,
  validateUserRole,
  generateRandomTokens,
} = require('../utils/general');
const { USER_STATUS } = require('../constants/users');
const config = require('../../config');

const inviteUser = catchAsync(async (req, res, next) => {
  const [invitationToken, invitationTokenEncrypted] = generateRandomTokens();

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: validateUserRole(req.body.role),
    invitedBy: req.user._id,
    techData: {
      invitationToken: invitationTokenEncrypted,
    },
  });

  try {
    const registrationUrl = `${config.clientUrl}/signup-by-invitation/${invitationToken}`;

    await new Email(newUser, registrationUrl).sendInvitation();

    res.status(HTTP_CODE.SUCCESS_CREATED).json({
      status: 'success',
      message: 'Invitation has been sent to email!',
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);

    return next(
      createError(
        HTTP_CODE.SERVER_ERROR,
        'There was an error sending the email. Try again later!'
      )
    );
  }
});

const getInvitationData = catchAsync(async (req, res, next) => {
  const hashedToken = hashString(req.params.token);

  const user = await User.findOne({
    'techData.invitationToken': hashedToken,
  }).populate('invitedBy', 'name -_id');

  if (!user) {
    return next(
      createError(
        HTTP_CODE.BAD_REQUEST,
        'Invitation link is invalid or has expired'
      )
    );
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: { user },
  });
});

const signUpByInvitation = catchAsync(async (req, res, next) => {
  const hashedToken = hashString(req.params.token);

  const user = await User.findOne({
    'techData.invitationToken': hashedToken,
  });

  if (!user) {
    return next(
      createError(
        HTTP_CODE.BAD_REQUEST,
        'Invitation link is invalid or has expired'
      )
    );
  }

  user.status = USER_STATUS.ACTIVE;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.techData.invitationToken = undefined;
  await user.save();

  createSendToken(user, HTTP_CODE.SUCCESS, res);
});

const cancelInvitation = catchAsync(async (req, res, next) => {
  const hashedToken = hashString(req.params.token);

  const user = await User.findOneAndDelete({
    'techData.invitationToken': hashedToken,
  });

  if (!user) {
    return next(
      createError(
        HTTP_CODE.NOT_FOUND,
        'This invitation has been already canceled'
      )
    );
  }

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    message: 'Invitation has been canceled successfully!',
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
    status: USER_STATUS.ACTIVE,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      createError(HTTP_CODE.UNAUTHORIZED, 'Incorrect email or password')
    );
  }

  createSendToken(user, HTTP_CODE.SUCCESS, res);
});

const logout = (req, res) => {
  // res.clearCookie('jwt');
  req.logout();

  res.status(HTTP_CODE.SUCCESS).json({ status: 'success' });
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    status: USER_STATUS.ACTIVE,
  });

  if (!user) {
    return next(
      createError(HTTP_CODE.NOT_FOUND, 'There is no user with email address.')
    );
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${config.clientUrl}/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(HTTP_CODE.SUCCESS).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.techData.passwordResetToken = undefined;
    user.techData.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      createError(
        HTTP_CODE.SERVER_ERROR,
        'There was an error sending the email. Try again later!'
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = hashString(req.params.token);

  const user = await User.findOne({
    'techData.passwordResetToken': hashedToken,
    'techData.passwordResetExpires': { $gt: Date.now() },
  });

  if (!user) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'Reset link is invalid or has expired')
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.techData.passwordResetToken = undefined;
  user.techData.passwordResetExpires = undefined;
  user.techData.passwordChangedAt = Date.now();
  await user.save();

  createSendToken(user, HTTP_CODE.SUCCESS, res);
});

module.exports = {
  login,
  logout,
  inviteUser,
  resetPassword,
  forgotPassword,
  cancelInvitation,
  getInvitationData,
  signUpByInvitation,
};
