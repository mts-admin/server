const createError = require('http-errors');

const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catchAsync');
const httpCodes = require('../constants/http-codes');
const responseStatus = require('../constants/response-status');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(httpCodes.SUCCESS).json({
      status: responseStatus.SUCCESS,
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(
        createError(httpCodes.NOT_FOUND, 'No document found with that ID')
      );
    }

    res.status(httpCodes.SUCCESS).json({
      status: responseStatus.SUCCESS,
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(httpCodes.SUCCESS_CREATED).json({
      status: responseStatus.SUCCESS,
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        createError(httpCodes.NOT_FOUND, 'No document found with that ID')
      );
    }

    res.status(httpCodes.SUCCESS).json({
      status: responseStatus.SUCCESS,
      data: doc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        createError(httpCodes.NOT_FOUND, 'No document found with that ID')
      );
    }

    res.status(httpCodes.SUCCESS_DELETED).json({
      status: responseStatus.SUCCESS,
      data: null,
    });
  });
