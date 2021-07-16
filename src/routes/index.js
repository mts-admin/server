const router = require('express').Router();

const authRouter = require('./auth-routes');
const userRouter = require('./user-routes');
const scheduleRouter = require('./schedule-routes');
const visitRouter = require('./visit-routes');
const financeRouter = require('./finance-routes');
const noteRouter = require('./note-routes');
const bonusRouter = require('./bonus-routes');
const activityRouter = require('./activity-routes');
const sprintRouter = require('./sprint-routes');
const taskRouter = require('./task-routes');

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/schedules', scheduleRouter);
router.use('/visits', visitRouter);
router.use('/finances', financeRouter);
router.use('/notes', noteRouter);
router.use('/bonuses', bonusRouter);
router.use('/activities', activityRouter);
router.use('/sprints', sprintRouter);
router.use('/tasks', taskRouter);

module.exports = router;
