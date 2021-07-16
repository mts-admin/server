const Task = require('../models/task');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const {
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require('./handler-factory');

const getTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find({
    userId: req.user.id,
    sprintId: req.params.sprintId,
  });

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: tasks,
  });
});

const getTask = getOne(Task, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

const createTask = createOne(Task, {
  body: {
    userId: ['user', 'id'],
    sprintId: ['params', 'sprintId'],
  },
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

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
