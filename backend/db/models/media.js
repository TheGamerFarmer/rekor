const { Schema, model } = require('mongoose');
const { MEDIA_TYPE } = require('../enums');

const mediaSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(MEDIA_TYPE), required: true },
    publication: { type: Schema.Types.ObjectId, ref: 'Publication', required: true },
  },
  { collection: 'media', versionKey: false },
);

module.exports = model('Media', mediaSchema);
