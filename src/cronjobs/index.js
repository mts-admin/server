const cron = require('node-cron');

const updateActivityStatus = require('./update-activity-status');
const makeSprintsExpired = require('./make-sprints-expired');
const config = require('../../config');

// every Saturday at 00:00
cron.schedule('0 0 * * 6', updateActivityStatus, {
  timezone: config.timezone,
});

// every day at 00:00
cron.schedule('0 0 * * *', makeSprintsExpired, {
  timezone: config.timezone,
});
