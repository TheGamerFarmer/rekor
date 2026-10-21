const user = require('./collections/user');
const set = require('./collections/set');
const match = require('./collections/match');
const team = require('./collections/team');
const event = require('./collections/event');

/**
 * Crée ce qui manque dans la base : collections, règles de validation, index.
 * Peut tourner à chaque démarrage sans rien casser.
 */
async function ensureSchema(db) {
  const existing = await db.listCollections({ name: 'user' }, { nameOnly: true }).toArray();

  if (existing.length === 0) {
    await user.createCollection(db);
    await set.createCollection(db);
    await match.createCollection(db);
    await team.createCollection(db);
    await event.createCollection(db);
  }
}

module.exports = { ensureSchema };
