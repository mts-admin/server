const { celebrate, Joi, Segments } = require('celebrate');

const getNotesSchema = Joi.object({
  sort: Joi.string().valid('createdAt', '-createdAt').optional(),
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  search: Joi.string().optional().allow(''),
  favorite: Joi.boolean().optional(),
});

const createNoteSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).max(5).optional(),
});

const updateNoteSchema = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).max(5).optional(),
  favorite: Joi.boolean().optional(),
});

const getNotesValidator = celebrate({
  [Segments.QUERY]: getNotesSchema,
});

const createNoteValidator = celebrate({
  [Segments.BODY]: createNoteSchema,
});

const updateNoteValidator = celebrate({
  [Segments.BODY]: updateNoteSchema,
});

module.exports = {
  getNotesValidator,
  createNoteValidator,
  updateNoteValidator,
};
