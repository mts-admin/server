const { celebrate, Joi, Segments } = require('celebrate');
const { ACTIVITY_STATUS } = require('../../constants/activity');

const getActivitiesSchema = Joi.object({
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  search: Joi.string().optional(),
  viewed: Joi.boolean().optional(),
  status: Joi.string()
    .valid(
      ACTIVITY_STATUS.ACTIVE,
      ACTIVITY_STATUS.DONE,
      ACTIVITY_STATUS.ARCHIVED
    )
    .optional(),
});

const createActivitySchema = Joi.object({
  content: Joi.string().required(),
  userId: Joi.string().required(),
  status: Joi.string()
    .valid(ACTIVITY_STATUS.CREATED, ACTIVITY_STATUS.ACTIVE)
    .optional()
    .default(ACTIVITY_STATUS.CREATED),
});

const updateActivitySchema = Joi.object({
  content: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(ACTIVITY_STATUS))
    .optional(),
});

const changeActivityStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      ACTIVITY_STATUS.ACTIVE,
      ACTIVITY_STATUS.DONE,
      ACTIVITY_STATUS.ARCHIVED
    )
    .required(),
});

const getActivitiesValidator = celebrate({
  [Segments.QUERY]: getActivitiesSchema,
});

const createActivityValidator = celebrate({
  [Segments.BODY]: createActivitySchema,
});

const updateActivityValidator = celebrate({
  [Segments.BODY]: updateActivitySchema,
});

const changeActivityStatusValidator = celebrate({
  [Segments.BODY]: changeActivityStatusSchema,
});

module.exports = {
  getActivitiesValidator,
  createActivityValidator,
  updateActivityValidator,
  changeActivityStatusValidator,
};
