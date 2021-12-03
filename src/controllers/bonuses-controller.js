const createError = require('http-errors');
const R = require('ramda');

const User = require('../models/user');
const Bonus = require('../models/bonus');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const moment = require('../utils/moment');
const {
  uploadSingleImage,
  updateSingleImage,
  removeSingleImage,
} = require('../utils/upload');
const HTTP_CODE = require('../constants/http-codes');
const { IMAGE_TYPE } = require('../constants/image-types');

const getMyBonuses = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Bonus.find({
      userId: req.user._id,
    }),
    req.query
  )
    .search('title', 'description')
    .sort()
    .filter()
    .populate('createdBy', 'name avatar -_id')
    .paginate();

  const bonuses = await query.query;
  const totalCount = await query.countDocuments();

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
    .sort()
    .populate('createdBy', 'name avatar -_id')
    .paginate();

  const bonuses = await query.query;
  const totalCount = await query.countDocuments();

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: bonuses,
  });
});

const getBonus = catchAsync(async (req, res, next) => {
  const bonus = await Bonus.findById(req.params.id).populate(
    'createdBy',
    'name avatar -_id'
  );

  if (!bonus) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Bonus not found!'));
  }

  if (!bonus.viewed && req.user._id.equals(bonus.userId)) {
    bonus.viewed = true;
    await bonus.save();
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

  const data = {
    ...req.body,
    createdAt: moment().format(),
    createdBy: req.user._id,
  };

  if (req.file) {
    const filePath = await uploadSingleImage({
      file: req.file,
      name: req.body.title,
      type: IMAGE_TYPE.BONUS,
    });

    data.image = filePath;
  }

  const bonus = await Bonus.create(data);

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: bonus,
  });
});

const updateBonus = catchAsync(async (req, res, next) => {
  const bonus = await Bonus.findByIdAndUpdate(
    req.params.id,
    R.omit(['image'], req.body),
    {
      new: true,
    }
  ).populate('createdBy', 'name avatar -_id');

  if (!bonus) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Bonus not found!'));
  }

  if (req.file) {
    const filePath = await updateSingleImage({
      file: req.file,
      name: bonus.title,
      oldLink: bonus.image,
      type: IMAGE_TYPE.BONUS,
    });

    bonus.image = filePath;
    await bonus.save({ validateBeforeSave: false });
  }

  // empty string inside body means that we need to delete old image
  if (req.body.image === '') {
    removeSingleImage(bonus.image);

    bonus.image = undefined;
    await bonus.save({ validateBeforeSave: false });
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: bonus,
  });
});

const deleteBonus = catchAsync(async (req, res, next) => {
  const bonus = await Bonus.findByIdAndDelete(req.params.id);

  if (!bonus) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Bonus not found!'));
  }

  if (bonus.image) {
    removeSingleImage(bonus.image);
  }

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getMyBonuses,
  getUserBonuses,
  getBonus,
  createBonus,
  updateBonus,
  deleteBonus,
};
