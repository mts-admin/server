const { celebrate, Joi, Segments } = require('celebrate');
const { USER_ROLE, USER_STATUS } = require('../../constants/users');

const getUsersListSchema = Joi.object({
  search: Joi.string().optional(),
});

const updateUserSchema = Joi.object({
  status: Joi.string()
    .valid(USER_STATUS.ACTIVE, USER_STATUS.DEACTIVATED)
    .optional(),
  role: Joi.string().valid(USER_ROLE.USER, USER_ROLE.ADMIN).optional(),
});

const updateMeSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  avatar: Joi.string().optional(),
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

const getUsersListValidator = celebrate({
  [Segments.QUERY]: getUsersListSchema,
});

const updateUserValidator = celebrate({
  [Segments.BODY]: updateUserSchema,
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
  getUsersListValidator,
  updateUserValidator,
  updateMeValidator,
  updateMyEmailValidator,
  updateMyPasswordValidator,
};
