const { Schema, model } = require('mongoose');

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { collection: 'group', versionKey: false },
);

groupSchema.index({ name: 1, created_at: 1, owner: 1 }, { unique: true });

module.exports = model('Group', groupSchema);
