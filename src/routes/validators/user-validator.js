const { celebrate, Joi, Segments } = require('celebrate');
const { USER_ROLE, USER_STATUS } = require('../../constants/users');

const getUsersListSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(USER_STATUS))
    .optional(),
  search: Joi.string().optional(),
});

const updateUserSchema = Joi.object({
  status: Joi.string()
    .valid(USER_STATUS.ACTIVE, USER_STATUS.DEACTIVATED)
    .optional(),
  role: Joi.string().valid(USER_ROLE.USER, USER_ROLE.ADMIN).optional(),
});

const getUsersListValidator = celebrate({
  [Segments.QUERY]: getUsersListSchema,
});

const updateUserValidator = celebrate({
  [Segments.BODY]: updateUserSchema,
});

module.exports = {
  getUsersListValidator,
  updateUserValidator,
};
