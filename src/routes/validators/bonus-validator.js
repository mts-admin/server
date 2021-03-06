const { celebrate, Joi, Segments } = require('celebrate');

const getBonusesListSchema = Joi.object({
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  search: Joi.string().optional().allow(''),
  viewed: Joi.boolean().optional(),
});

const createBonusSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  userId: Joi.string().required(),
  image: Joi.any().optional(),
});

const updateBonusSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  image: Joi.any().optional(),
});

const getBonusesListValidator = celebrate({
  [Segments.QUERY]: getBonusesListSchema,
});

const createBonusValidator = celebrate({
  [Segments.BODY]: createBonusSchema,
});

const updateBonusValidator = celebrate({
  [Segments.BODY]: updateBonusSchema,
});

module.exports = {
  getBonusesListValidator,
  createBonusValidator,
  updateBonusValidator,
};
