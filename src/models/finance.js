const { Schema, model } = require('mongoose');

const { FINANCE_TYPE } = require('../constants/finance');

const financeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(FINANCE_TYPE),
  },
  date: Date,
  userId: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: Date,
});

financeSchema.index({ userId: 1, title: 1, description: 1, date: 1 });

const Finance = model('Finance', financeSchema);

module.exports = Finance;
