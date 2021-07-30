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
  image: {
    type: String,
    default: 'gift.png',
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

bonusSchema.index({ title: 1, description: 1 });

const Bonus = model('Bonus', bonusSchema);

module.exports = Bonus;
