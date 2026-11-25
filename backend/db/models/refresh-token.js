const { Schema, model } = require('mongoose');

const refreshTokenSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { collection: 'refresh_tokens', versionKey: false },
);

refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model('RefreshToken', refreshTokenSchema);
