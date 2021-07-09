const createError = require('http-errors');

const Bonus = require('../models/bonus');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const User = require('../models/user');
const { updateOne, deleteOne } = require('./handler-factory');

const getMyBonuses = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Bonus.find({
      userId: req.user._id,
    }),
    req.query
  )
    .search('title', 'description')
    .filter()
    .paginate();

  const bonuses = await query.query;
  const totalCount = await query.query.countDocuments();

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: bonuses,
  });
});

const getUserBonuses = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Bonus.find({
      userId: req.params.userId,
    }),
    req.query
  )
    .search('title', 'description')
    .filter()
    .paginate();

  const bonuses = await query.query;
  const totalCount = await query.query.countDocuments();

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: bonuses,
  });
});

const getBonus = catchAsync(async (req, res, next) => {
  const bonus = await Bonus.findById(req.params.id, (err, item) => {
    if (!item.viewed && req.user._id.equals(item.userId)) {
      item.viewed = true;
      item.save();
    }
  });

  if (!bonus) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Bonus not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: bonus,
  });
});

const createBonus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.userId);

  if (!user) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  const bonus = await Bonus.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: bonus,
  });
});

const updateBonus = updateOne(Bonus, {
  match: {
    _id: ['params', 'id'],
  },
});

const deleteBonus = deleteOne(Bonus, {
  match: {
    _id: ['params', 'id'],
  },
});

module.exports = {
  getMyBonuses,
  getUserBonuses,
  getBonus,
  createBonus,
  updateBonus,
  deleteBonus,
};
