const createError = require('http-errors');
const { v4: uuidv4 } = require('uuid');

const Visit = require('../models/visit');
const moment = require('../utils/moment');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { VISIT_RECURRING, VISIT_STATUS } = require('../constants/visits');
const { generateRecurringVisitsData } = require('../utils/visits');
const { getOne, updateOne, deleteOne } = require('./handler-factory');

// TODO: check creating a huge amount of visits

const getScheduleVisits = catchAsync(async (req, res, next) => {
  const { scheduleId } = req.params;

  const query = new APIFeatures(Visit.find({ scheduleId }), req.query)
    .sort('startTime')
    .dateFilter('startTime');

  const visits = await query.query;

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: visits,
  });
});

const createOneOffVisit = catchAsync(async (req, res, next) => {
  const { startTime, endTime, title, notes } = req.body;

  const visit = await Visit.create({
    title,
    notes,
    startTime: moment(startTime).format(),
    endTime: moment(endTime).format(),
    scheduleId: req.params.scheduleId,
    recurring: VISIT_RECURRING.ONE_OFF,
    status: VISIT_STATUS.ACTIVE,
    createdBy: req.user._id,
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: visit,
  });
});

const createRecurringVisits = catchAsync(async (req, res, next) => {
  const {
    title,
    notes,
    fromDate,
    toDate,
    startTime,
    endTime,
    recurring,
    daysOfWeek, // is used only for weekly visits
  } = req.body;

  const visitsData = generateRecurringVisitsData({
    title,
    notes,
    fromDate,
    toDate,
    startTime,
    endTime,
    recurring,
    daysOfWeek,
    scheduleId: req.params.scheduleId,
    status: VISIT_STATUS.ACTIVE,
    createdBy: req.user._id,
    groupId: uuidv4(),
  });

  const visits = await Visit.insertMany(visitsData);

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: visits,
  });
});

const getVisit = getOne(Visit, {
  match: {
    _id: ['params', 'visitId'],
  },
  populate: {
    path: 'createdBy',
    select: 'name avatar -_id',
  },
});

const updateVisit = updateOne(Visit, {
  match: {
    _id: ['params', 'visitId'],
  },
  populate: {
    path: 'createdBy',
    select: 'name avatar -_id',
  },
});

const deleteVisit = deleteOne(Visit, {
  match: {
    _id: ['params', 'visitId'],
  },
});

const updateVisitsGroup = catchAsync(async (req, res, next) => {
  const data = await Visit.updateMany(
    { groupId: req.params.groupId },
    req.body,
    {
      new: true,
    }
  ).populate('createdBy', 'name avatar -_id');

  if (data.n === 0) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Visits not found'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    message: 'Visits have been updated successfully!',
  });
});

const deleteVisitsGroup = catchAsync(async (req, res, next) => {
  const data = await Visit.deleteMany({ groupId: req.params.groupId });

  if (data.n === 0) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Visits not found'));
  }

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getVisit,
  updateVisit,
  deleteVisit,
  getScheduleVisits,
  createOneOffVisit,
  createRecurringVisits,
  updateVisitsGroup,
  deleteVisitsGroup,
};
