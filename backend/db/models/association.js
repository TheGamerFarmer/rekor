const { Schema, model } = require('mongoose');

const associationSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { collection: 'association', versionKey: false },
);

associationSchema.index({ name: 1, address: 1 }, { unique: true });

module.exports = model('Association', associationSchema);
