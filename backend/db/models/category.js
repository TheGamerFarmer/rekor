const { Schema, model } = require('mongoose');

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { collection: 'category', versionKey: false },
);

categorySchema.index({ name: 1 }, { unique: true });

module.exports = model('Category', categorySchema);
