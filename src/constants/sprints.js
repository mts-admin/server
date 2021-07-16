const SPRINT_STATUS = {
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  EXPIRED: 'expired',
  ARCHIVED: 'archived',
};

const SPRINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const TASK_STATUS = {
  ACTIVE: 'active',
  DONE: 'done',
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
