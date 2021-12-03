const { celebrate, Joi, Segments } = require('celebrate');
const { USER_ROLE, USER_STATUS } = require('../../constants/users');

const getUsersListSchema = Joi.object({
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  status: Joi.string()
    .valid(...Object.values(USER_STATUS))
    .optional(),
  role: Joi.string()
    .valid(...Object.values(USER_ROLE))
    .optional(),
  search: Joi.string().optional().allow(''),
  sort: Joi.string()
    .valid('name', '-name', 'createdAt', '-createdAt')
    .optional(),
});

const updateUserSchema = Joi.object({
  status: Joi.string()
    .valid(USER_STATUS.ACTIVE, USER_STATUS.DEACTIVATED)
    .optional(),
  role: Joi.string().valid(USER_ROLE.USER, USER_ROLE.ADMIN).optional(),
});

const inviteUserSchema = Joi.object({
  name: Joi.string().max(50).required(),
  role: Joi.string().valid(USER_ROLE.USER, USER_ROLE.ADMIN).required(),
  email: Joi.string().email().required(),
});

const getUsersListValidator = celebrate({
  [Segments.QUERY]: getUsersListSchema,
});

const updateUserValidator = celebrate({
  [Segments.BODY]: updateUserSchema,
});

const inviteUserValidator = celebrate({
  [Segments.BODY]: inviteUserSchema,
});

module.exports = {
  getUsersListValidator,
  updateUserValidator,
  inviteUserValidator,
};
