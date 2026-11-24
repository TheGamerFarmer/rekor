const mongoose = require('mongoose');

require('./models/user');
require('./models/refresh-token');
const Association = require('./models/association');
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

const DEFAULT_ASSOCIATION = {
  name: 'Gières Volley-Ball',
  address: '1 Rue des Sports 38610 Gières',
};

/**
 * Creates missing collections and synchronises indexes for all registered Mongoose models.
 * Seeds the default association and is safe to call on every startup.
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

  try {
    await Association.updateOne(
      DEFAULT_ASSOCIATION,
      { $setOnInsert: DEFAULT_ASSOCIATION },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000 || !(await Association.exists(DEFAULT_ASSOCIATION))) {
      throw error;
    }
  }
}

module.exports = { ensureSchema };
