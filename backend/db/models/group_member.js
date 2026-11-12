const { Schema, model } = require('mongoose');

const groupMemberSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { collection: 'group_member', versionKey: false },
);

groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

module.exports = model('GroupMember', groupMemberSchema);
