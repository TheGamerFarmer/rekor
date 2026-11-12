const { Schema, model } = require('mongoose');

const refereeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  },
  { collection: 'referee', versionKey: false },
);

refereeSchema.index({ user: 1, match: 1 }, { unique: true });

module.exports = model('Referee', refereeSchema);
