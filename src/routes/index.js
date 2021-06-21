const router = require('express').Router();

const authRouter = require('./auth-routes');
const scheduleRouter = require('./schedule-routes');

router.use('/auth', authRouter);
router.use('/schedules', scheduleRouter);

module.exports = router;
