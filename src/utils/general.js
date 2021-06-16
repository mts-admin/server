const crypto = require('crypto');
const escapeStringRegexp = require('escape-string-regexp');

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

module.exports = {
  validateUserRole,
  hashString,
  generateRandomTokens,
  getSearchMatch,
};
