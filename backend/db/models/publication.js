const { Schema, model } = require('mongoose');

const publicationSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    association: { type: Schema.Types.ObjectId, ref: 'Association', required: true },
  },
  { collection: 'publication', versionKey: false },
);

publicationSchema.index({ title: 1, body: 1, created_at: 1, association: 1 }, { unique: true });

module.exports = model('Publication', publicationSchema);
