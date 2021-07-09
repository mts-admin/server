const R = require('ramda');
const crypto = require('crypto');
const escapeStringRegexp = require('escape-string-regexp');

const moment = require('./moment');
const { USER_ROLE } = require('../constants/users');

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
  const diff = moment(end).diff(moment(start));

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
};
