const USER_STATUS = {
  INVITED: 'invited',
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
};

const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  OWNER: 'owner',
};

const SCHEDULE_PERMISSIONS = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

module.exports = { USER_STATUS, USER_ROLE, SCHEDULE_PERMISSIONS };
