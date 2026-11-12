const { Schema, model } = require('mongoose');

const statisticCategorySchema = new Schema(
  {
    statistic: { type: Schema.Types.ObjectId, ref: 'Statistic', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { collection: 'statistic_category', versionKey: false },
);

statisticCategorySchema.index({ statistic: 1, category: 1 }, { unique: true });

module.exports = model('StatisticCategory', statisticCategorySchema);
