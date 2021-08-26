const createError = require('http-errors');
const R = require('ramda');

const User = require('../models/user');
const config = require('../../config');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { createSendToken } = require('../utils/auth');
const Email = require('../utils/email');
const {
  hashString,
  validateUserRole,
  generateRandomTokens,
} = require('../utils/general');
const { updateSingleImage, removeSingleImage } = require('../utils/upload');
const { USER_STATUS } = require('../constants/users');
const { IMAGE_TYPE } = require('../constants/image-types');

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
  })
    .populate('invitedBy', 'name -_id')
    .select('-_id -id -__v -techData -avatar -status');

  if (!user) {
    return next(
      createError(
        HTTP_CODE.UNAUTHORIZED,
        'Invitation link is invalid or has expired'
      )
    );
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: user,
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
        HTTP_CODE.UNAUTHORIZED,
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
      createError(
        HTTP_CODE.NOT_FOUND,
        'There is no user with this email address.'
      )
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
      createError(
        HTTP_CODE.UNAUTHORIZED,
        'Reset link is invalid or has expired'
      )
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

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    'newBonusesCount newActivitiesCount'
  );

  if (!user) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: user,
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    R.omit(['avatar'], req.body),
    {
      new: true,
    }
  );

  if (!user) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  if (req.file) {
    const filePath = await updateSingleImage({
      file: req.file,
      name: user.name,
      oldLink: user.avatar,
      type: IMAGE_TYPE.USER,
    });

    user.avatar = filePath;
    await user.save({ validateBeforeSave: false });
  }

  // empty string inside body means that we need to delete old image
  if (req.body.avatar === '') {
    removeSingleImage(user.avatar);

    user.avatar = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: user,
  });
});

// TODO: add email confirmation
const updateMyEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'Your current password is wrong.')
    );
  }

  user.email = req.body.email;
  await user.save({ validateBeforeSave: false });

  createSendToken(user, HTTP_CODE.SUCCESS, res);
});

const updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'Your current password is wrong.')
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.techData.passwordChangedAt = Date.now();
  await user.save();

  createSendToken(user, HTTP_CODE.SUCCESS, res);
});

module.exports = {
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
};
