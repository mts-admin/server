const Note = require('../models/note');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const {
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require('./handler-factory');

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

const getNote = getOne(Note, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

const createNote = createOne(Note, {
  body: {
    userId: ['user', 'id'],
  },
});

const updateNote = updateOne(Note, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

const deleteNote = deleteOne(Note, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

module.exports = { getNote, createNote, updateNote, deleteNote, getMyNotes };
