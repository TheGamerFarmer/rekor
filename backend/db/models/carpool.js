const { Schema, model } = require('mongoose');

const carpoolSchema = new Schema(
  {
    maxSeats: { type: Number, required: true },
    electric: { type: Boolean, required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  },
  { collection: 'carpool', versionKey: false },
);

module.exports = model('Carpool', carpoolSchema);
