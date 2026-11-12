const { Schema, model } = require('mongoose');

const participantSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  { collection: 'participant', versionKey: false },
);

participantSchema.index({ created_by: 1, event: 1 }, { unique: true });

module.exports = model('Participant', participantSchema);
