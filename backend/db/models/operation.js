const { Schema, model } = require('mongoose');

const operationSchema = new Schema(
  {
    name: { type: String, required: true },
    formula: { type: String, required: true },
  },
  { collection: 'operation', versionKey: false },
);

operationSchema.index({ name: 1 }, { unique: true });

module.exports = model('Operation', operationSchema);
