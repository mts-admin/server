const router = require('express').Router();

const authRouter = require('./auth-routes');
const scheduleRouter = require('./schedule-routes');
const visitRouter = require('./visit-routes');
const financeRouter = require('./finance-routes');
const noteRouter = require('./note-routes');

router.use('/auth', authRouter);
router.use('/schedules', scheduleRouter);
router.use('/visits', visitRouter);
router.use('/finances', financeRouter);
router.use('/notes', noteRouter);

module.exports = router;
