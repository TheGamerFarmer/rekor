const { AsyncLocalStorage } = require('node:async_hooks');
const { Schema } = require('mongoose');

/**
 * Per-request storage that propagates the authenticated user's ID to Mongoose hooks
 * without threading it through every function call.
 */
const userContext = new AsyncLocalStorage();

/**
 * Mongoose global plugin that automatically adds audit fields to every schema:
 *   - `created_at` / `updated_at`: timestamps set by save and update hooks
 *   - `created_by` / `updated_by`: authenticated user reference (when available)
 *
 * @param {import('mongoose').Schema} schema
 */
function auditPlugin(schema) {
  schema.add({
    created_at: Date,
    updated_at: Date,
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  });

  schema.pre('save', function () {
    const now = new Date();
    if (this.isNew) this.created_at = now;
    this.updated_at = now;

    const userId = userContext.getStore()?.userId;
    if (userId) {
      if (this.isNew) this.created_by = userId;
      this.updated_by = userId;
    }
  });

  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function () {
    const update = this.getUpdate();
    if (!update.$set) update.$set = {};
    update.$set.updated_at = new Date();

    const userId = userContext.getStore()?.userId;
    if (userId) update.$set.updated_by = userId;
  });
}

module.exports = { auditPlugin, userContext };
