const { celebrate, Joi, Segments } = require('celebrate');
const { TASK_STATUS } = require('../../constants/sprints');

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  notes: Joi.string().optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  notes: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(TASK_STATUS))
    .optional(),
});

const createTaskValidator = celebrate({
  [Segments.BODY]: createTaskSchema,
});

const updateTaskValidator = celebrate({
  [Segments.BODY]: updateTaskSchema,
});

module.exports = {
  createTaskValidator,
  updateTaskValidator,
};
