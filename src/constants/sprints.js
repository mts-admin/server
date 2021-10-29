const SPRINT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  EXPIRED: 'EXPIRED',
  ARCHIVED: 'ARCHIVED',
};

const SPRINT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

const TASK_STATUS = {
  ACTIVE: 'ACTIVE',
  DONE: 'DONE',
};

const SPRINT_SORT_VALUES = [
  'createdAt',
  '-createdAt',
  'dueDate',
  '-dueDate',
  'priority',
  '-priority',
];

module.exports = {
  SPRINT_STATUS,
  SPRINT_PRIORITY,
  TASK_STATUS,
  SPRINT_SORT_VALUES,
};
