const R = require('ramda');
const createError = require('http-errors');

const Sprint = require('../models/sprint');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { getOne, createOne } = require('./handler-factory');
const { TASK_STATUS, SPRINT_STATUS } = require('../constants/sprints');
const { getSprintsSortValue, getSprintStatus } = require('../utils/sprints');
const Task = require('../models/task');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;

const getSprints = catchAsync(async (req, res, next) => {
  const {
    sort,
    status,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  } = req.query;

  const skip = (page - 1) * limit;
  const match = {
    userId: req.user._id,
    ...(status && { status }),
  };

  const [{ sprints, totalCount }] = await Sprint.aggregate([
    {
      $facet: {
        totalCount: [
          {
            $match: match,
          },
          {
            $count: 'totalCount',
          },
        ],
        sprints: [
          { $match: match },
          ...getSprintsSortValue(sort),
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: Task.collection.collectionName,
              let: { sprintId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$$sprintId', '$sprintId'] },
                  },
                },
                { $project: { status: 1 } },
              ],
              as: 'tasks',
            },
          },
          {
            $addFields: {
              totalTasksCount: { $size: '$tasks' },
              completedTasksCount: {
                $size: {
                  $filter: {
                    input: '$tasks',
                    cond: { $eq: ['$$this.status', TASK_STATUS.DONE] },
                  },
                },
              },
            },
          },
          {
            $unset: ['tasks', 'sortField'],
          },
        ],
      },
    },
  ]);

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: R.pathOr(0, ['0', 'totalCount'], totalCount),
    data: sprints,
  });
});

const getSprint = getOne(Sprint, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

const createSprint = createOne(Sprint, {
  body: {
    userId: ['user', 'id'],
  },
});

const updateSprint = catchAsync(async (req, res, next) => {
  const { status, dueDate } = req.body;

  const newStatus = getSprintStatus(status, dueDate);
  const body = {
    ...req.body,
    ...(newStatus && { status: newStatus }),
  };

  const sprint = await Sprint.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
    },
    body,
    {
      new: true,
    }
  );

  if (!sprint) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Sprint not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: sprint,
  });
});

const deleteSprint = catchAsync(async (req, res, next) => {
  await Promise.all([
    Task.deleteMany({ sprintId: req.params.id }),
    Sprint.findByIdAndDelete(req.params.id),
  ]);

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
});

const completeSprint = catchAsync(async (req, res, next) => {
  const sprint = await Sprint.findById(req.params.id);

  if (!sprint) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Sprint not found!'));
  }

  await Promise.all([
    Task.updateMany({ sprintId: req.params.id }, { status: TASK_STATUS.DONE }),
    Sprint.findByIdAndUpdate(req.params.id, { status: SPRINT_STATUS.DONE }),
  ]);

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    message: 'Sprint has been completed successfully',
  });
});

module.exports = {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
  completeSprint,
};
