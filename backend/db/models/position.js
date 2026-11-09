const { Schema, model } = require('mongoose');

const positionSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { collection: 'position', versionKey: false },
);

positionSchema.index({ name: 1 }, { unique: true });

module.exports = model('Position', positionSchema);
