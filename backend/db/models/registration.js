const { Schema, model } = require('mongoose');

const registrationSchema = new Schema(
  {
    association: { type: Schema.Types.ObjectId, ref: 'Association', required: true },
  },
  { collection: 'registration', versionKey: false },
);

registrationSchema.index({ association: 1, created_by: 1, created_at: 1 }, { unique: true });

module.exports = model('Registration', registrationSchema);
