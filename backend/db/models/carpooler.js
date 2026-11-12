const { Schema, model } = require('mongoose');

const carpoolerSchema = new Schema(
  {
    carpool: { type: Schema.Types.ObjectId, ref: 'Carpool', required: true },
    takenSeats: { type: Number, required: true },
  },
  { collection: 'carpooler', versionKey: false },
);

carpoolerSchema.index({ created_by: 1, carpool: 1 }, { unique: true });

module.exports = model('Carpooler', carpoolerSchema);
