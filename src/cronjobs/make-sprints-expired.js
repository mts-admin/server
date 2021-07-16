const Sprint = require('../models/sprint');
const moment = require('../utils/moment');
const { SPRINT_STATUS } = require('../constants/sprints');

const makeSprintsExpired = async (sprints) => {
  try {
    await Promise.all(
      sprints.map(async (sprint) => {
        await Sprint.findByIdAndUpdate(sprint._id, {
          status: SPRINT_STATUS.EXPIRED,
        });
      })
    );
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = async () => {
  await Sprint.find({
    dueDate: {
      $lt: moment().toISOString(),
    },
    status: SPRINT_STATUS.IN_PROGRESS,
  }).then(makeSprintsExpired);
};
