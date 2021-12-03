const createError = require('http-errors');
const R = require('ramda');

const User = require('../models/user');
const Bonus = require('../models/bonus');
const Activity = require('../models/activity');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { getOne } = require('./handler-factory');
const { generateRandomTokens, validateUserRole } = require('../utils/general');
const Email = require('../utils/email');
const moment = require('../utils/moment');
const config = require('../../config');
const { USER_STATUS } = require('../constants/users');

const getUsersList = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    User.find({
      _id: { $ne: req.user._id },
    }),
    req.query
  )
    .filter()
    .search('name', 'email')
    .sort()
    .paginate();

  const users = await query.query;
  const totalCount = await query.countDocuments();

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: users,
  });
});

const getUser = getOne(User, {
  match: {
    _id: ['params', 'id'],
  },
  populate: {
    path: 'invitedBy',
    select: 'name avatar',
  },
});

// only for status (active, deactivated) and role (user, admin)
// validation is implemented via Joi
const updateUser = catchAsync(async (req, res, next) => {
  const body = R.pick(['status', 'role'], req.body);
  const match = {
    $and: [
      { _id: req.params.id },
      { _id: { $ne: req.user._id } },
      { status: { $ne: USER_STATUS.INVITED } },
    ],
  };

  const user = await User.findOneAndUpdate(match, body, {
    new: true,
  });

  if (!user) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: user,
  });
});

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
    createdAt: moment().format(),
  });

  try {
    const registrationUrl = `${config.clientUrl}/auth/signup-by-invitation/${invitationToken}`;

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

const cancelInvitation = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndDelete({
    'techData.invitationToken': req.params.token,
  });

  if (!user) {
    return next(
      createError(
        HTTP_CODE.NOT_FOUND,
        'This invitation has been already canceled'
      )
    );
  }

  await Promise.all([
    Bonus.deleteMany({ userId: user._id }),
    Activity.deleteMany({ userId: user._id }),
  ]);

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    message: 'Invitation has been canceled successfully!',
  });
});

module.exports = {
  getUser,
  updateUser,
  inviteUser,
  getUsersList,
  cancelInvitation,
};
