// for nested routes (sprints)
const router = require('express').Router({ mergeParams: true });

const { protect } = require('../middlewares/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task-controller');
const {
  createTaskValidator,
  updateTaskValidator,
} = require('./validators/task-validator');

// Protect all routes after this middleware
router.use(protect);

router.route('/').get(getTasks).post(createTaskValidator, createTask);

router
  .route('/:id')
  .get(getTask)
  .patch(updateTaskValidator, updateTask)
  .delete(deleteTask);

module.exports = router;
