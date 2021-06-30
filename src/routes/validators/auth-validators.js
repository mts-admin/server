const { celebrate, Joi, Segments } = require('celebrate');
const { USER_ROLE } = require('../../constants/users');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const passwordsSchema = Joi.object({
  password: Joi.string().min(8).required(),
  passwordConfirm: Joi.string().min(8).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const inviteUserSchema = Joi.object({
  name: Joi.string().required(),
  role: Joi.string().valid(USER_ROLE.USER, USER_ROLE.ADMIN).required(),
  email: Joi.string().email().required(),
});

const updateMyPasswordSchema = Joi.object({
  passwordCurrent: Joi.string().min(8).required(),
  password: Joi.string().min(8).required(),
  passwordConfirm: Joi.string().min(8).required(),
});

const loginValidator = celebrate({ [Segments.BODY]: loginSchema });

const passwordsValidator = celebrate({
  [Segments.BODY]: passwordsSchema,
});

const forgotPasswordValidator = celebrate({
  [Segments.BODY]: forgotPasswordSchema,
});

const inviteUserValidator = celebrate({
  [Segments.BODY]: inviteUserSchema,
});

const updateMyPasswordValidator = celebrate({
  [Segments.BODY]: updateMyPasswordSchema,
});

module.exports = {
  loginValidator,
  passwordsValidator,
  inviteUserValidator,
  forgotPasswordValidator,
  updateMyPasswordValidator,
};