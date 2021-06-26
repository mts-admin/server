const router = require('express').Router();

const authRouter = require('./auth-routes');
const scheduleRouter = require('./schedule-routes');
const visitRouter = require('./visit-routes');

router.use('/auth', authRouter);
router.use('/schedules', scheduleRouter);
router.use('/visits', visitRouter);

module.exports = router;
