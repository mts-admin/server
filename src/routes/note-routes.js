const router = require('express').Router();

const { protect } = require('../middlewares/auth');
const {
  getNotesValidator,
  createNoteValidator,
  updateNoteValidator,
} = require('./validators/note-validators');
const {
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getMyNotes,
} = require('../controllers/note-controller');

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(getNotesValidator, getMyNotes)
  .post(createNoteValidator, createNote);

router
  .route('/:id')
  .get(getNote)
  .patch(updateNoteValidator, updateNote)
  .delete(deleteNote);

module.exports = router;
