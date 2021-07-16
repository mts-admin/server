const router = require('express').Router();

const { protect } = require('../middlewares/auth');
const {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
  completeSprint,
} = require('../controllers/sprint-controller');
const {
  getSprintsValidator,
  createSprintValidator,
  updateSprintValidator,
} = require('./validators/sprint-validator');
const taskRouter = require('./task-routes');

// for nested routes
router.use('/:sprintId/tasks', taskRouter);

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(getSprintsValidator, getSprints)
  .post(createSprintValidator, createSprint);

router
  .route('/:id')
  .get(getSprint)
  .patch(updateSprintValidator, updateSprint)
  .delete(deleteSprint);

router.patch('/:id/complete', completeSprint);

module.exports = router;
