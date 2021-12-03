const R = require('ramda');
const moment = require('./moment');
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
      if (!daysOfWeek.includes(moment(date).day())) {
        return null;
      }

      const startDate = moment(date).set({
        hour: moment(startTime).hours(),
        minute: moment(startTime).minutes(),
      });
      const endDate = moment(date).set({
        hour: moment(endTime).hours(),
        minute: moment(endTime).minutes(),
      });

      return R.filter(Boolean, {
        title,
        notes,
        status,
        groupId,
        scheduleId,
        recurring,
        createdBy,
        startTime: startDate,
        endTime: endDate,
        createdAt: moment().format(),
        ...(recurring === VISIT_RECURRING.WEEKLY && { daysOfWeek }),
      });
    })
    .filter(Boolean);

  return data;
};

module.exports = { generateRecurringVisitsData };
