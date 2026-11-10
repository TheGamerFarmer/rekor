const { Schema, model } = require('mongoose');

const statisticSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { collection: 'statistic', versionKey: false },
);

module.exports = model('Statistic', statisticSchema);
