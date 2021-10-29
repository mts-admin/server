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
const { setTimeToDate } = require('../utils/general');

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
    createdAt: moment().format(),
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

  if (moment(fromDate).diff(toDate, 'year') !== 0) {
    return next(
      createError(
        HTTP_CODE.BAD_REQUEST,
        'You cannot create visits for more than 1 year!'
      )
    );
  }

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
});

const deleteVisit = deleteOne(Visit, {
  match: {
    _id: ['params', 'visitId'],
  },
});

const updateVisitsGroup = catchAsync(async (req, res, next) => {
  const visit = await Visit.findById(req.params.visitId);

  if (!visit) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Visit not found'));
  }

  if (!visit.groupId) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'This visit is not recurring')
    );
  }

  const data = await Visit.find({
    scheduleId: req.params.scheduleId,
    groupId: visit.groupId,
    // update only future visits which are scheduled after current visit
    startTime: {
      $gte: moment(visit.startTime).format(),
    },
  })
    .sort({ startTime: 1 })
    .lean();

  if (data.length === 0) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Visits not found'));
  }

  const bulk = data.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: {
        ...req.body,
        // if we want to edit start or end time of all visits
        // we only need to change the time of each visit. date must stay the same
        ...(req.body.startTime && {
          startTime: setTimeToDate(item.startTime, req.body.startTime),
        }),
        ...(req.body.endTime && {
          endTime: setTimeToDate(item.endTime, req.body.endTime),
        }),
      },
    },
  }));

  await Visit.bulkWrite(bulk);

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    message: 'Visits have been updated successfully!',
  });
});

const deleteVisitsGroup = catchAsync(async (req, res, next) => {
  const visit = await Visit.findById(req.params.visitId);

  if (!visit) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Visit not found'));
  }

  if (!visit.groupId) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'This visit is not recurring')
    );
  }

  const data = await Visit.deleteMany({
    scheduleId: req.params.scheduleId,
    groupId: visit.groupId,
    // delete only future visits which are scheduled after current visit
    startTime: {
      $gte: moment(visit.startTime).format(),
    },
  });

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
