const R = require('ramda');
const { celebrate, Joi, Segments } = require('celebrate');

const { VISIT_RECURRING, VISIT_STATUS } = require('../../constants/visits');

const getScheduleVisitsSchema = Joi.object({
  start: Joi.date().iso().optional(),
  end: Joi.date().iso().min(Joi.ref('start')).optional(),
});

const createOneOffVisitSchema = Joi.object({
  title: Joi.string().max(100).required(),
  notes: Joi.string().optional(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().min(Joi.ref('startTime')).required(),
});

const createRecurringVisitsSchema = Joi.object({
  title: Joi.string().max(100).required(),
  notes: Joi.string().optional(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().min(Joi.ref('startTime')).required(),
  fromDate: Joi.date().iso().required(),
  toDate: Joi.date().iso().iso().min(Joi.ref('fromDate')).required(),
  recurring: Joi.string()
    .valid(VISIT_RECURRING.DAILY, VISIT_RECURRING.WEEKLY)
    .required(),
  daysOfWeek: Joi.array()
    .items(Joi.number().valid(...R.range(0, 7))) // from 0 to 6
    .when('recurring', {
      is: VISIT_RECURRING.WEEKLY,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
});

const updateVisitSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  notes: Joi.string().optional(),
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().min(Joi.ref('startTime')).optional(),
  status: Joi.string()
    .valid(VISIT_STATUS.ACTIVE, VISIT_STATUS.CANCELED)
    .optional(),
});

const getScheduleVisitsValidator = celebrate({
  [Segments.QUERY]: getScheduleVisitsSchema,
});

const createOneOffVisitValidator = celebrate({
  [Segments.BODY]: createOneOffVisitSchema,
});

const createRecurringVisitsValidator = celebrate({
  [Segments.BODY]: createRecurringVisitsSchema,
});

const updateVisitValidator = celebrate({
  [Segments.BODY]: updateVisitSchema,
});

module.exports = {
  updateVisitValidator,
  getScheduleVisitsValidator,
  createOneOffVisitValidator,
  createRecurringVisitsValidator,
};
