const { Schema, model } = require('mongoose');
const { DOCUMENT_TYPES } = require('../enums');

const documentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    association: { type: Schema.Types.ObjectId, ref: 'Association', required: true },
  },
  { collection: 'document', versionKey: false },
);

documentSchema.index({ fileName: 1 }, { unique: true });

module.exports = model('Document', documentSchema);
