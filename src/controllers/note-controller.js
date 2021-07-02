const createError = require('http-errors');

const Note = require('../models/note');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');

const getMyNotes = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Note.find({
      userId: req.user._id,
    }),
    req.query
  )
    .sort()
    .filter()
    .search('title', 'content', 'tags')
    .paginate();

  const notes = await query.query;
  const totalCount = await query.query.countDocuments();

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: notes,
  });
});

const getNote = catchAsync(async (req, res, next) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Note not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: note,
  });
});

const createNote = catchAsync(async (req, res, next) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: note,
  });
});

const updateNote = catchAsync(async (req, res, next) => {
  const note = await Note.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id,
    },
    req.body,
    {
      new: true,
    }
  );

  if (!note) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Note not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: note,
  });
});

const deleteNote = catchAsync(async (req, res, next) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Note not found!'));
  }

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
});

module.exports = { getNote, createNote, updateNote, deleteNote, getMyNotes };
