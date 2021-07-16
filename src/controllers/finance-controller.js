const Finance = require('../models/finance');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const {
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require('./handler-factory');
const { FINANCE_TYPE } = require('../constants/finance');
const { getDateMatch, getPaginatedQueryCount } = require('../utils/general');

const getFinanceList = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Finance.find({
      userId: req.user._id,
    }),
    req.query
  )
    .sort('date')
    .search('title', 'description')
    .dateFilter('date')
    .paginate();

  const finances = await query.query;
  const totalCount = await getPaginatedQueryCount(query.query);

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: finances,
  });
});

const getFinanceItem = getOne(Finance, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

const createFinanceItem = createOne(Finance, {
  body: {
    userId: ['user', 'id'],
  },
});

const updateFinanceItem = updateOne(Finance, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
});

const deleteFinanceItem = deleteOne(Finance, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
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
