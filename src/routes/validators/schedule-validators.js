const { celebrate, Joi, Segments } = require('celebrate');
const { SCHEDULE_PERMISSIONS } = require('../../constants/users');

const createScheduleSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(3).max(100).optional(),
});

const getSchedulesQuerySchema = Joi.object({
  sort: Joi.string().optional(),
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional(),
});

const updateScheduleSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  description: Joi.string().min(3).max(100).optional(),
});

const addParticipantSchema = Joi.object({
  participantEmail: Joi.string().email().required(),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(SCHEDULE_PERMISSIONS)))
    .required(),
});

const updateParticipantSchema = Joi.object({
  participantId: Joi.string().required(),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(SCHEDULE_PERMISSIONS)))
    .required(),
});

const deleteParticipantSchema = Joi.object({
  participantId: Joi.string().required(),
});

const createScheduleValidator = celebrate({
  [Segments.BODY]: createScheduleSchema,
});

const getSchedulesValidator = celebrate({
  [Segments.QUERY]: getSchedulesQuerySchema,
});

const updateScheduleValidator = celebrate({
  [Segments.BODY]: updateScheduleSchema,
});

const addParticipantValidator = celebrate({
  [Segments.BODY]: addParticipantSchema,
});

const updateParticipantValidator = celebrate({
  [Segments.BODY]: updateParticipantSchema,
});

const deleteParticipantValidator = celebrate({
  [Segments.BODY]: deleteParticipantSchema,
});

module.exports = {
  createScheduleValidator,
  getSchedulesValidator,
  updateScheduleValidator,
  addParticipantValidator,
  updateParticipantValidator,
  deleteParticipantValidator,
};
