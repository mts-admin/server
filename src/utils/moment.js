const moment = require('moment');
const momentRange = require('moment-range');
const momentTimezone = require('moment-timezone');

momentTimezone.tz.setDefault('Europe/Kiev');

module.exports = momentRange.extendMoment(moment);
