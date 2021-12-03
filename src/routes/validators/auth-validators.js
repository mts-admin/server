const { celebrate, Joi, Segments } = require('celebrate');

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

const updateMeSchema = Joi.object({
  name: Joi.string().max(50).optional(),
  avatar: Joi.any().optional(),
});

const updateMyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
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

const updateMeValidator = celebrate({
  [Segments.BODY]: updateMeSchema,
});

const updateMyEmailValidator = celebrate({
  [Segments.BODY]: updateMyEmailSchema,
});

const updateMyPasswordValidator = celebrate({
  [Segments.BODY]: updateMyPasswordSchema,
});

module.exports = {
  loginValidator,
  updateMeValidator,
  passwordsValidator,
  updateMyEmailValidator,
  forgotPasswordValidator,
  updateMyPasswordValidator,
};
