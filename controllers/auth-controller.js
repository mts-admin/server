const createError = require('http-errors');

const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const httpCodes = require('../constants/http-codes');
const responseStatus = require('../constants/response-status');
const { createSendToken } = require('../utils/auth');
const Email = require('../utils/email');
const {
  hashString,
  validateUserRole,
  generateRandomTokens,
} = require('../utils/general');
const { USER_STATUS } = require('../constants/users');

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
    const registrationUrl = `${process.env.CLIENT_URL}/signup-by-invitation/${invitationToken}`;

    await new Email(newUser, registrationUrl).sendInvitation();

    res.status(httpCodes.SUCCESS_CREATED).json({
      status: responseStatus.SUCCESS,
      message: 'Invitation has been sent to email!',
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);

    return next(
      createError(
        httpCodes.SERVER_ERROR,
        'There was an error sending the email. Try again later!'
      )
    );
  }
});

const getInvitationData = catchAsync(async (req, res, next) => {
  const hashedToken = hashString(req.params.token);

  const user = await User.findOne({
    'techData.invitationToken': hashedToken,
  }).populate({
    path: 'invitedBy',
    fields: 'name',
  });

  if (!user) {
    return next(
      createError(
        httpCodes.BAD_REQUEST,
        'Invitation link is invalid or has expired'
      )
    );
  }

  res.status(httpCodes.SUCCESS).json({
    status: responseStatus.SUCCESS,
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
        httpCodes.BAD_REQUEST,
        'Invitation link is invalid or has expired'
      )
    );
  }

  user.status = USER_STATUS.ACTIVE;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.techData.invitationToken = undefined;
  await user.save();

  createSendToken(user, httpCodes.SUCCESS, res);
});

const cancelInvitation = catchAsync(async (req, res, next) => {
  const hashedToken = hashString(req.params.token);

  await User.findOneAndDelete({
    'techData.invitationToken': hashedToken,
  });

  res.status(httpCodes.SUCCESS_DELETED).json({
    status: responseStatus.SUCCESS,
    message: 'Invitation has been canceled successfully!',
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      createError(httpCodes.BAD_REQUEST, 'Please provide email and password!')
    );
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      createError(httpCodes.UNAUTHORIZED, 'Incorrect email or password')
    );
  }

  createSendToken(user, httpCodes.SUCCESS, res);
});

const logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(httpCodes.SUCCESS).json({ status: responseStatus.SUCCESS });
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      createError(httpCodes.NOT_FOUND, 'There is no user with email address.')
    );
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(httpCodes.SUCCESS).json({
      status: responseStatus.SUCCESS,
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.techData.passwordResetToken = undefined;
    user.techData.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      createError(
        httpCodes.SERVER_ERROR,
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
      createError(httpCodes.BAD_REQUEST, 'Reset link is invalid or has expired')
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.techData.passwordResetToken = undefined;
  user.techData.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, httpCodes.SUCCESS, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      createError(httpCodes.UNAUTHORIZED, 'Your current password is wrong.')
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, httpCodes.SUCCESS, res);
});

module.exports = {
  login,
  logout,
  inviteUser,
  resetPassword,
  forgotPassword,
  updatePassword,
  cancelInvitation,
  getInvitationData,
  signUpByInvitation,
};
