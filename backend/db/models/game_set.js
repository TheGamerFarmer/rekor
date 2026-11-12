const { Schema, model } = require('mongoose');

const gameSetSchema = new Schema(
  {
    number: { type: Number, required: true },
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  },
  { collection: 'set', versionKey: false },
);

gameSetSchema.index({ number: 1, match: 1 }, { unique: true });

module.exports = model('GameSet', gameSetSchema);
