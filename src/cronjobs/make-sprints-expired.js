const Sprint = require('../models/sprint');
const moment = require('../utils/moment');
const { SPRINT_STATUS } = require('../constants/sprints');

const makeSprintsExpired = async (sprint) => {
  try {
    await Sprint.findByIdAndUpdate(sprint._id, {
      status: SPRINT_STATUS.EXPIRED,
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = async () => {
  await Sprint.find({
    dueDate: {
      $lt: moment().format(),
    },
    status: SPRINT_STATUS.IN_PROGRESS,
  })
    .cursor({ batchSize: 50 })
    .eachAsync(makeSprintsExpired);
};
