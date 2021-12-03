const { celebrate, Joi, Segments } = require('celebrate');

const {
  SPRINT_STATUS,
  SPRINT_PRIORITY,
  SPRINT_SORT_VALUES,
} = require('../../constants/sprints');

const getSprintsSchema = Joi.object({
  sort: Joi.string()
    .valid(...SPRINT_SORT_VALUES)
    .optional(),
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  status: Joi.string()
    .valid(...Object.values(SPRINT_STATUS))
    .optional(),
});

const createSprintSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  priority: Joi.string()
    .valid(...Object.values(SPRINT_PRIORITY))
    .required(),
  dueDate: Joi.date().iso().required(),
  status: Joi.string()
    .valid(
      SPRINT_STATUS.IN_PROGRESS,
      SPRINT_STATUS.DONE,
      SPRINT_STATUS.ARCHIVED
    )
    .default(SPRINT_STATUS.IN_PROGRESS),
});

const updateSprintSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  priority: Joi.string()
    .valid(...Object.values(SPRINT_PRIORITY))
    .optional(),
  status: Joi.string()
    .valid(
      SPRINT_STATUS.IN_PROGRESS,
      SPRINT_STATUS.DONE,
      SPRINT_STATUS.ARCHIVED
    )
    .optional(),
  dueDate: Joi.date().iso().optional(),
});

const getSprintsValidator = celebrate({
  [Segments.QUERY]: getSprintsSchema,
});

const createSprintValidator = celebrate({
  [Segments.BODY]: createSprintSchema,
});

const updateSprintValidator = celebrate({
  [Segments.BODY]: updateSprintSchema,
});

module.exports = {
  getSprintsValidator,
  createSprintValidator,
  updateSprintValidator,
};
