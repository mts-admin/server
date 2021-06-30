const createError = require('http-errors');

const Finance = require('../models/finance');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { FINANCE_TYPE } = require('../constants/finance');
const { getDateMatch } = require('../utils/general');

const getFinanceList = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Finance.find({
      userId: req.user._id,
    }),
    req.query
  )
    .sort()
    .search('title', 'description')
    .dateFilter('date')
    .paginate();

  const finances = await query.query;
  const totalCount = await query.query.countDocuments();

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: finances,
  });
});

const getFinanceItem = catchAsync(async (req, res, next) => {
  const finance = await Finance.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!finance) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Item not found'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: finance,
  });
});

const createFinanceItem = catchAsync(async (req, res, next) => {
  const finance = await Finance.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: finance,
  });
});

const updateFinanceItem = catchAsync(async (req, res, next) => {
  const finance = await Finance.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id,
    },
    req.body,
    {
      new: true,
    }
  );

  if (!finance) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Item not found'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: finance,
  });
});

const deleteFinanceItem = catchAsync(async (req, res, next) => {
  const finance = await Finance.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!finance) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Item not found'));
  }

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
});

const getFinanceStatisticByDate = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;

  const stats = await Finance.aggregate([
    {
      $match: {
        userId: req.user._id,
        ...getDateMatch(start, end, 'date'),
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        income: {
          $sum: {
            $cond: {
              if: { $eq: ['$type', FINANCE_TYPE.INCOME] },
              then: '$total',
              else: 0,
            },
          },
        },
        outcome: {
          $sum: {
            $cond: {
              if: { $eq: ['$type', FINANCE_TYPE.OUTCOME] },
              then: '$total',
              else: 0,
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        income: 1,
        outcome: 1,
      },
    },
  ]);

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: stats,
  });
});

const getFinanceFullStatistic = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;

  const stats = await Finance.aggregate([
    {
      $match: {
        userId: req.user._id,
        ...getDateMatch(start, end, 'date'),
      },
    },
    {
      $group: {
        _id: '$type',
        total: {
          $sum: '$total',
        },
      },
    },
  ]);

  const result = stats.reduce(
    (acc, { _id, total }) => ({ ...acc, [_id]: total }),
    {}
  );

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  getFinanceList,
  getFinanceItem,
  createFinanceItem,
  updateFinanceItem,
  deleteFinanceItem,
  getFinanceStatisticByDate,
  getFinanceFullStatistic,
};
