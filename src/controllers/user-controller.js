const User = require('../models/user');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { getOne, updateOne } = require('./handler-factory');

const getUsersList = catchAsync(async (req, res, next) => {
  const { status } = req.query;

  const query = new APIFeatures(
    User.find({
      ...(status && {
        status: { $in: status.split(',') },
      }),
    }),
    req.query
  ).search('name');

  const users = await query.query;

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: users,
  });
});

const getUser = getOne(User, {
  match: {
    _id: ['params', 'id'],
  },
});

// only for status (active, deactivated) and role (user, admin)
// validation is implemented via Joi
const updateUser = updateOne(User, {
  match: {
    _id: ['params', 'id'],
  },
});

module.exports = {
  getUser,
  updateUser,
  getUsersList,
};
