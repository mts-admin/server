const { Schema, model } = require('mongoose');

const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    validate: [(value) => value.length <= 5, '{PATH} exceeds the limit of 5'],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: Date,
});

noteSchema.index({ userId: 1, title: 1, content: 1, tags: 1 });

const Note = model('Note', noteSchema);

module.exports = Note;
