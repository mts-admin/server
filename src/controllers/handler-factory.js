const createError = require('http-errors');

const moment = require('../utils/moment');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { mapObjectByReq } = require('../utils/general');

const getOne = (Model, { match, populate }) =>
  catchAsync(async (req, res, next) => {
    const matchOptions = mapObjectByReq(req, match);

    const doc = await Model.findOne(matchOptions).populate(populate);

    if (!doc) {
      return next(createError(HTTP_CODE.NOT_FOUND, 'Document not found!'));
    }

    res.status(HTTP_CODE.SUCCESS).json({
      status: 'success',
      data: doc,
    });
  });

const createOne = (Model, { reqBody, restBody }) =>
  catchAsync(async (req, res, next) => {
    const bodyOptions = {
      ...req.body,
      ...mapObjectByReq(req, reqBody),
      ...restBody,
      createdAt: moment().format(),
    };

    const doc = await Model.create(bodyOptions);

    res.status(HTTP_CODE.SUCCESS_CREATED).json({
      status: 'success',
      data: doc,
    });
  });

const updateOne = (Model, { match, populate, body = {} }) =>
  catchAsync(async (req, res, next) => {
    const matchOptions = mapObjectByReq(req, match);
    const bodyOptions = {
      ...req.body,
      ...mapObjectByReq(req, body),
    };

    const doc = await Model.findOneAndUpdate(matchOptions, bodyOptions, {
      new: true,
    }).populate(populate);

    if (!doc) {
      return next(createError(HTTP_CODE.NOT_FOUND, 'Document not found!'));
    }

    res.status(HTTP_CODE.SUCCESS).json({
      status: 'success',
      data: doc,
    });
  });

const deleteOne = (Model, { match }) =>
  catchAsync(async (req, res, next) => {
    const matchOptions = mapObjectByReq(req, match);

    const doc = await Model.findOneAndDelete(matchOptions);

    if (!doc) {
      return next(createError(HTTP_CODE.NOT_FOUND, 'Document not found!'));
    }

    res.status(HTTP_CODE.SUCCESS_DELETED).json({
      status: 'success',
      data: null,
    });
  });

module.exports = { getOne, updateOne, deleteOne, createOne };
