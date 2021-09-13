const R = require('ramda');
const crypto = require('crypto');
const escapeStringRegexp = require('escape-string-regexp');

const moment = require('./moment');
const { USER_ROLE } = require('../constants/users');
const { IMAGE_FIELD_NAME, IMAGE_TYPE } = require('../constants/image-types');

const validateUserRole = (role) => {
  const allowedRoles = [USER_ROLE.USER, USER_ROLE.ADMIN];

  if (!allowedRoles.includes(role)) {
    return USER_ROLE.USER;
  }

  return role;
};

const hashString = (str) =>
  crypto.createHash('sha256').update(str).digest('hex');

const generateRandomTokens = () => {
  const randomToken = crypto.randomBytes(32).toString('hex');
  const randomTokenEncrypted = hashString(randomToken);

  return [randomToken, randomTokenEncrypted];
};

const getSearchMatch = (searchPhrase, fields) => {
  let searchRe = searchPhrase.trim();

  if (!!searchRe && searchRe.length > 1) {
    searchRe = new RegExp(`${escapeStringRegexp(searchRe)}`, 'gi');

    return {
      $or: fields.map((field) => ({ [field]: { $regex: searchRe } })),
    };
  }

  return {};
};

const getDateMatch = (startDate, endDate, fieldName) =>
  startDate &&
  endDate && {
    [fieldName]: {
      $gte: startDate,
      $lte: endDate,
    },
  };

const getDateInterval = (startDate, endDate) => {
  const rangeOfDates = moment.range(startDate, endDate);
  const days = Array.from(rangeOfDates.by('day')).map((item) =>
    item.startOf('day').format()
  );

  return days;
};

const getDateDiff = (start, end) => {
  const startDate = moment().set({
    hour: moment(start).get('hour'),
    minute: moment(start).get('minute'),
    millisecond: 0,
  });
  const endDate = moment().set({
    hour: moment(end).get('hour'),
    minute: moment(end).get('minute'),
    millisecond: 0,
  });
  const diff = endDate.diff(startDate);

  const seconds = Math.abs(diff) / 1000;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);

  return `${String(hours).padStart(2, 0)}:${String(minutes).padStart(2, 0)}`;
};

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

// { match: { _id: ['params', 'id'] } } =>
// { match: { _id: req.params.id } }
const mapObjectByReq = (req, obj) => R.map((path) => R.path(path, req), obj);

const getFileSize = (fileName) => {
  const ONE_MB_IN_BYTES = 1048576;

  return R.cond([
    [R.equals(IMAGE_FIELD_NAME.IMAGE), () => ONE_MB_IN_BYTES * 2],
    [R.equals(IMAGE_FIELD_NAME.AVATAR), () => ONE_MB_IN_BYTES * 5],
    [R.T, () => ONE_MB_IN_BYTES],
  ])(fileName);
};

const getFileResolution = (type) =>
  R.cond([
    [R.equals(IMAGE_TYPE.BONUS), () => [1200, 1200]],
    [R.equals(IMAGE_TYPE.USER), () => [800, 800]],
    [R.T, () => [800, 800]],
  ])(type);

module.exports = {
  validateUserRole,
  hashString,
  generateRandomTokens,
  getSearchMatch,
  getDateMatch,
  getDateDiff,
  getDateInterval,
  capitalizeFirstLetter,
  mapObjectByReq,
  getFileSize,
  getFileResolution,
};
