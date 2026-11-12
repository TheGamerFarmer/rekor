const { Schema, model } = require('mongoose');

const publicationSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    titre: { type: String, required: true },
    corps: { type: String, required: true },
    date: { type: Date, required: true },
    association: { type: Schema.Types.ObjectId, ref: 'Association', required: true },
  },
  { collection: 'publication', versionKey: false },
);

publicationSchema.index({ titre: 1, corps: 1, date: 1, association: 1 }, { unique: true });

module.exports = model('Publication', publicationSchema);
