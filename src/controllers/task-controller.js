const createError = require('http-errors');

const Task = require('../models/task');
const Sprint = require('../models/sprint');
const moment = require('../utils/moment');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { updateOne, deleteOne } = require('./handler-factory');

const getTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find({
    userId: req.user.id,
    sprintId: req.params.sprintId,
  }).sort('createdAt');

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: tasks,
  });
});

const createTask = catchAsync(async (req, res, next) => {
  const sprint = await Sprint.findById(req.params.sprintId);

  if (!sprint) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Sprint not found!'));
  }

  const task = await Task.create({
    ...req.body,
    userId: req.user.id,
    sprintId: req.params.sprintId,
    createdAt: moment().format(),
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: task,
  });
});

const updateTask = updateOne(Task, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

const deleteTask = deleteOne(Task, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

module.exports = { getTasks, createTask, updateTask, deleteTask };
