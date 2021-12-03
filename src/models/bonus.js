const { Schema, model } = require('mongoose');

const bonusSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  viewed: {
    type: Boolean,
    default: false,
  },
  image: String,
  userId: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: Date,
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

bonusSchema.index({ userId: 1, title: 1, description: 1 });

const Bonus = model('Bonus', bonusSchema);

module.exports = Bonus;
