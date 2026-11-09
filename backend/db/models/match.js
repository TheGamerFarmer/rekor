const { Schema, model } = require('mongoose');

const matchSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    opponent: { type: String, required: true },
  },
  { collection: 'match', versionKey: false },
);

matchSchema.index({ event: 1, opponent: 1 }, { unique: true });

module.exports = model('Match', matchSchema);
