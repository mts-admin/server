const createError = require('http-errors');
const { v4: uuidv4 } = require('uuid');

const Visit = require('../models/visit');
const moment = require('../utils/moment');
const catchAsync = require('../utils/catch-async');
const httpCodes = require('../constants/http-codes');
const { VISIT_RECURRING, VISIT_STATUS } = require('../constants/visits');
const { generateRecurringVisitsData } = require('../utils/visits');

const getScheduleVisits = catchAsync(async (req, res, next) => {
  const { scheduleId } = req.params;
  const {
    start = moment().startOf('month').format(),
    end = moment().endOf('month').format(),
  } = req.query;

  const visits = await Visit.find({
    scheduleId,
    startTime: {
      $gte: start,
      $lte: end,
    },
  });

  res.status(httpCodes.SUCCESS).json({
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

  res.status(httpCodes.SUCCESS_CREATED).json({
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

  res.status(httpCodes.SUCCESS_CREATED).json({
    status: 'success',
    data: visits,
  });
});

const getVisit = catchAsync(async (req, res, next) => {
  const visit = await Visit.findById(req.params.visitId).populate(
    'createdBy',
    'name avatar -_id'
  );

  if (!visit) {
    return next(createError(httpCodes.NOT_FOUND, 'Visit not found'));
  }

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: visit,
  });
});

const updateVisit = catchAsync(async (req, res, next) => {
  const visit = await Visit.findByIdAndUpdate(req.params.visitId, req.body, {
    new: true,
  }).populate('createdBy', 'name avatar -_id');

  if (!visit) {
    return next(createError(httpCodes.NOT_FOUND, 'Visit not found'));
  }

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: visit,
  });
});

const deleteVisit = catchAsync(async (req, res, next) => {
  const visit = await Visit.findByIdAndDelete(req.params.visitId);

  if (!visit) {
    return next(createError(httpCodes.NOT_FOUND, 'Visit not found'));
  }

  res.status(httpCodes.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
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
    return next(createError(httpCodes.NOT_FOUND, 'Visits not found'));
  }

  const visits = await Visit.find({ groupId: req.params.groupId });

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: visits,
  });
});

const deleteVisitsGroup = catchAsync(async (req, res, next) => {
  const data = await Visit.deleteMany({ groupId: req.params.groupId });

  if (data.n === 0) {
    return next(createError(httpCodes.NOT_FOUND, 'Visits not found'));
  }

  res.status(httpCodes.SUCCESS_DELETED).json({
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
