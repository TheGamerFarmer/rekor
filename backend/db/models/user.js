const { Schema, model } = require('mongoose');
const { USER_ROLE, USER_PRONOUN } = require('../enums');

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: String,
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      required: true,
    },
    birthday: Date,
    pronoun: {
      type: String,
      enum: Object.values(USER_PRONOUN),
      required: true,
    },
  },
  { collection: 'users', versionKey: false },
);

userSchema.index(
  { name: 1, firstName: 1, email: 1, phoneNumber: 1, birthday: 1 },
  { unique: true },
);

module.exports = model('User', userSchema);
