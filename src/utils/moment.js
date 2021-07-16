const moment = require('moment');
const momentRange = require('moment-range');
const momentTimezone = require('moment-timezone');
const config = require('../../config');

momentTimezone.tz.setDefault(config.timezone);

module.exports = momentRange.extendMoment(moment);
