const { Schema, model } = require('mongoose');

const teamStatSchema = new Schema(
  {
    statistic: { type: Schema.Types.ObjectId, ref: 'Statistic', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    set: { type: Schema.Types.ObjectId, ref: 'GameSet', required: true },
    value: { type: Number, required: true },
  },
  { collection: 'team_stat', versionKey: false },
);

teamStatSchema.index({ statistic: 1, team: 1, set: 1 }, { unique: true });

module.exports = model('TeamStat', teamStatSchema);
