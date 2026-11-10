const { Schema, model } = require('mongoose');

const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { collection: 'team', versionKey: false },
);

teamSchema.index({ name: 1, leader: 1 }, { unique: true });

module.exports = model('Team', teamSchema);
