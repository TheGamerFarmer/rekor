const { Schema, model } = require('mongoose');
const { EVENT_TYPES } = require('../enums');

const eventSchema = new Schema(
  {
    date: { type: Date, required: true },
    place: { type: String, required: true },
    type: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  },
  { collection: 'event', versionKey: false },
);

eventSchema.index(
  { date: 1, place: 1, type: 1, name: 1, description: 1, group: 1 },
  { unique: true },
);

module.exports = model('Event', eventSchema);
