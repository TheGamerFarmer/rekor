const { Schema, model } = require('mongoose');

const playerPositionSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    set: { type: Schema.Types.ObjectId, ref: 'GameSet', required: true },
    position: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
    nbOut: { type: Number, required: true },
    nbIn: { type: Number, required: true },
  },
  { collection: 'player_position', versionKey: false },
);

playerPositionSchema.index({ player: 1, set: 1, position: 1 }, { unique: true });

module.exports = model('PlayerPosition', playerPositionSchema);
