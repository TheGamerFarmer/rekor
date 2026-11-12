const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    body: { type: String, required: true },
  },
  { collection: 'message', versionKey: false },
);

messageSchema.index({ group: 1, created_by: 1, created_at: 1, body: 1 }, { unique: true });

module.exports = model('Message', messageSchema);
