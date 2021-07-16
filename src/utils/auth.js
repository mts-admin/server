const jwt = require('jsonwebtoken');
const config = require('../../config');

const signToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // const cookieOptions = {
  //   expires: new Date(
  //     Date.now() + config.jwtCookieExpiresIn * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  //   secure: config.nodeEnv === 'production',
  // };
  // res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

module.exports = { signToken, createSendToken };
