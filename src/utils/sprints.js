const R = require('ramda');

const { SPRINT_PRIORITY, SPRINT_STATUS } = require('../constants/sprints');
const moment = require('./moment');

const getSortingOrder = (sort) => {
  if (sort.includes('-')) return -1;

  return 1;
};

const getSprintsSortValue = (sort = '') =>
  R.cond([
    [
      (value) => value.includes('createdAt'),
      () => [
        {
          $sort: { createdAt: getSortingOrder(sort) },
        },
      ],
    ],
    [
      (value) => value.includes('dueDate'),
      () => [
        {
          $sort: { dueDate: getSortingOrder(sort) },
        },
      ],
    ],
    [
      (value) => value.includes('priority'),
      // sort sprint from low to high priority and vice versa
      () => [
        {
          $addFields: {
            sortField: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$priority', SPRINT_PRIORITY.LOW] },
                    then: 0,
                  },
                  {
                    case: { $eq: ['$priority', SPRINT_PRIORITY.MEDIUM] },
                    then: 1,
                  },
                  {
                    case: { $eq: ['$priority', SPRINT_PRIORITY.HIGH] },
                    then: 2,
                  },
                ],
                default: 3,
              },
            },
          },
        },
        {
          $sort: { sortField: getSortingOrder(sort) },
        },
      ],
    ],
    [R.T, () => []],
  ])(sort);

const getSprintStatus = (newStatus, newDueDate) => {
  if (newStatus) {
    return newStatus;
  }
  if (moment().isAfter(newDueDate, 'day')) {
    return SPRINT_STATUS.EXPIRED;
  }
  if (moment().isSameOrBefore(newDueDate, 'day')) {
    return SPRINT_STATUS.IN_PROGRESS;
  }

  return newStatus;
};

module.exports = { getSprintsSortValue, getSprintStatus };
