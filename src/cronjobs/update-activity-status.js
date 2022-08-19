const Activity = require('../models/activity');
const User = require('../models/user');
const moment = require('../utils/moment');
const { ACTIVITY_STATUS } = require('../constants/activity');

const changeActivityStatus = async (user) => {
  try {
    // get 1 random activity of each user and make it active
    const [activity] = await Activity.aggregate([
      {
        $match: {
          userId: user._id,
          status: ACTIVITY_STATUS.CREATED,
        },
      },
      {
        $sample: { size: 1 },
      },
    ]);

    if (activity) {
      await Activity.findByIdAndUpdate(activity._id, {
        status: ACTIVITY_STATUS.ACTIVE,
        becameActiveAt: moment().format(),
      });
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = async () => {
  await User.find().cursor({ batchSize: 50 }).eachAsync(changeActivityStatus);
};
