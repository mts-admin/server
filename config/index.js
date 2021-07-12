module.exports = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  clientUrl: process.env.CLIENT_URL,
  mongoUrl: process.env.DATABASE,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
  timezone: process.env.TIMEZONE,
  mailtrap: {
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    userName: process.env.MAILTRAP_USERNAME,
    password: process.env.MAILTRAP_PASSWORD,
  },
  sendGrid: {
    userName: process.env.SENDGRID_USERNAME,
    password: process.env.SENDGRID_PASSWORD,
  },
  emailFrom: process.env.EMAIL_FROM,
};
