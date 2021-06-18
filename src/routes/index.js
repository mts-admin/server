const router = require('express').Router();

const userRouter = require('./user-routes');
const scheduleRouter = require('./schedule-routes');

router.use('/users', userRouter);
router.use('/schedules', scheduleRouter);

module.exports = router;
