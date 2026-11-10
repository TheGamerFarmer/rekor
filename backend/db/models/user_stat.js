const { Schema, model } = require('mongoose');

const userStatSchema = new Schema(
  {
    statistic: { type: Schema.Types.ObjectId, ref: 'Statistic', required: true },
    set: { type: Schema.Types.ObjectId, ref: 'GameSet', required: true },
    value: { type: Number, required: true },
  },
  { collection: 'user_stat', versionKey: false },
);

userStatSchema.index({ statistic: 1, created_by: 1, set: 1 }, { unique: true });

module.exports = model('UserStat', userStatSchema);
