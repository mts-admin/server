const { celebrate, Joi, Segments } = require('celebrate');
const { TASK_STATUS } = require('../../constants/sprints');

const createTaskSchema = Joi.object({
  title: Joi.string().max(100).required(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().max(100).optional(),
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
