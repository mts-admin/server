const R = require('ramda');
const {
  formatISO,
  startOfDay,
  getMinutes,
  getHours,
  getDay,
  add,
} = require('date-fns');
const { VISIT_RECURRING } = require('../constants/visits');
const { getDateInterval } = require('./general');

const generateRecurringVisitsData = ({
  title,
  notes,
  fromDate,
  toDate,
  startTime,
  endTime,
  recurring,
  scheduleId,
  status,
  createdBy,
  groupId,
  daysOfWeek = R.range(0, 7),
}) => {
  // generate array of dates interval between start & end dates
  const dateInterval = getDateInterval(fromDate, toDate);

  const data = dateInterval
    .map((date) => {
      if (!daysOfWeek.includes(getDay(date))) {
        return null;
      }

      const startDate = add(startOfDay(date), {
        hours: getHours(startTime),
        minutes: getMinutes(startTime),
      });
      const endDate = add(startOfDay(date), {
        hours: getHours(endTime),
        minutes: getMinutes(endTime),
      });

      return R.filter(Boolean, {
        title,
        notes,
        status,
        groupId,
        scheduleId,
        recurring,
        createdBy,
        startTime: formatISO(startDate),
        endTime: formatISO(endDate),
        ...(recurring === VISIT_RECURRING.WEEKLY && { daysOfWeek }),
      });
    })
    .filter(Boolean);

  return data;
};

module.exports = { generateRecurringVisitsData };
