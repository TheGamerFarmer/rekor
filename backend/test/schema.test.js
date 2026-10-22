const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../db/db');
const { ensureSchema } = require('../db/schema');

const EXPECTED_COLLECTIONS = [
  'user',
  'set',
  'match',
  'event',
  'team',
  'group',
  'message',
  'carpool',
  'association',
  'document',
  'bank_operation',
  'publication',
  'media',
  'participant',
  'group_member',
  'carpooler',
  'carpool_payment',
  'registration',
  'bank_operation_document',
  'statistic',
  'operation',
  'user_stat',
  'team_stat',
  'position',
  'category',
  'statistic_category',
  'player_position',
  'referee',
];

describe('ensureSchema', () => {
  let mongod;
  let database;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'test' });
    database = db.getDb();
    await ensureSchema(database);
  });

  after(async () => {
    await db.close();
    await mongod.stop();
  });

  it('crée toutes les collections attendues', async () => {
    const existing = await database.listCollections({}, { nameOnly: true }).toArray();
    const names = existing.map((c) => c.name);
    for (const col of EXPECTED_COLLECTIONS) {
      assert.ok(names.includes(col), `Collection manquante : ${col}`);
    }
  });

  it('est idempotente (peut tourner deux fois sans erreur)', async () => {
    await assert.doesNotReject(ensureSchema(database));
  });

  it('propage les erreurs inattendues de createCollection', async () => {
    const fakeDb = {
      createCollection: async () => {
        const err = new Error('erreur inattendue');
        err.codeName = 'UnexpectedError';
        throw err;
      },
      collection: () => ({ createIndex: async () => {} }),
    };
    await assert.rejects(ensureSchema(fakeDb), /erreur inattendue/);
  });
});
