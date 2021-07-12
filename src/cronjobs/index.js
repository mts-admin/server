const cron = require('node-cron');

const updateActivityStatus = require('./update-activity-status');
const config = require('../../config');

// every Saturday at 00:00
cron.schedule('0 0 * * 6', updateActivityStatus, {
  timezone: config.timezone,
});
