const mongoose = require('mongoose');

require('./models/user');
require('./models/refresh-token');
require('./models/association');
require('./models/group');
require('./models/team');
require('./models/event');
require('./models/match');
require('./models/game_set');
require('./models/participant');
require('./models/referee');
require('./models/category');
require('./models/statistic');
require('./models/statistic_category');
require('./models/user_stat');
require('./models/team_stat');
require('./models/position');
require('./models/player_position');
require('./models/group_member');
require('./models/message');
require('./models/media');
require('./models/publication');
require('./models/document');
require('./models/carpool');
require('./models/carpooler');
require('./models/carpool_payment');
require('./models/operation');
require('./models/bank_operation');
require('./models/bank_operation_document');
require('./models/registration');

/**
 * Creates missing collections and synchronises indexes for all registered Mongoose models.
 * Safe to call on every startup — existing collections are silently skipped.
 */
async function ensureSchema() {
  for (const modelName of Object.keys(mongoose.models)) {
    const Model = mongoose.models[modelName];
    try {
      await Model.createCollection();
    } catch (err) {
      if (err.codeName !== 'NamespaceExists') throw err;
    }
    await Model.syncIndexes();
  }
}

module.exports = { ensureSchema };
