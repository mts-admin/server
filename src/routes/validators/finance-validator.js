const { celebrate, Joi, Segments } = require('celebrate');

const { FINANCE_TYPE } = require('../../constants/finance');

const getFinanceListSchema = Joi.object({
  sort: Joi.string().optional(),
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
  search: Joi.string().optional(),
  start: Joi.date().iso().optional(),
  end: Joi.date().iso().min(Joi.ref('start')).optional(),
});

const createFinanceItemSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  total: Joi.number().min(0).required(),
  type: Joi.string()
    .valid(FINANCE_TYPE.INCOME, FINANCE_TYPE.OUTCOME)
    .required(),
  date: Joi.date().iso().optional(),
});

const updateFinanceItemSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  total: Joi.number().min(0).optional(),
  type: Joi.string()
    .valid(FINANCE_TYPE.INCOME, FINANCE_TYPE.OUTCOME)
    .optional(),
  date: Joi.date().iso().optional(),
});

const getStatsSchema = Joi.object({
  start: Joi.date().iso().optional(),
  end: Joi.date().iso().min(Joi.ref('start')).optional(),
});

const getFinanceListValidator = celebrate({
  [Segments.QUERY]: getFinanceListSchema,
});

const createFinanceItemValidator = celebrate({
  [Segments.BODY]: createFinanceItemSchema,
});

const updateFinanceItemValidator = celebrate({
  [Segments.BODY]: updateFinanceItemSchema,
});

const getStatsValidator = celebrate({
  [Segments.QUERY]: getStatsSchema,
});

module.exports = {
  getFinanceListValidator,
  createFinanceItemValidator,
  updateFinanceItemValidator,
  getStatsValidator,
};
